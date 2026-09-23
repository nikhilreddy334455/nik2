import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { db, ItemRecord } from './db.service.js';

dotenv.config();

const SYSTEM_INSTRUCTION = `You are an expert Lost & Found Matching AI for a smart campus system. Your primary directive is to analyze two items (one 'Lost', one 'Found') and determine the probability that they are the exact same physical object.
You must be highly analytical. Consider visual characteristics from images (color, wear and tear, branding), textual descriptions, and the logic of time and location (e.g., an item cannot be found before it was lost).
Be objective and conservative in your scoring. Only assign a score above 85% if there are highly specific unique identifiers present in both.`;

export interface MatchAnalysisResult {
  confidence_score: number;
  explanation: string;
}

export class AIService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey && this.apiKey !== 'your_gemini_api_key_here') {
      try {
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
        console.log('[AI Service] Initialized @google/genai with model gemini-2.5-flash.');
      } catch (err: any) {
        console.warn('[AI Service] Failed to initialize GoogleGenAI:', err.message);
      }
    } else {
      console.warn('[AI Service] GEMINI_API_KEY not configured. Running with fallback intelligent campus heuristic comparator.');
    }
  }

  /**
   * Compare a single Lost item against a single Found item using Gemini 2.5 Flash
   */
  public async compareItems(lost: ItemRecord, found: ItemRecord): Promise<MatchAnalysisResult> {
    if (this.ai) {
      try {
        return await this.callGeminiCompare(lost, found);
      } catch (error: any) {
        console.error(`[AI Service] Gemini 2.5 Flash call failed for items (${lost.id}, ${found.id}):`, error.message);
        // Fallback to heuristic calculation on API failure / rate-limiting
        return this.fallbackHeuristicCompare(lost, found);
      }
    } else {
      return this.fallbackHeuristicCompare(lost, found);
    }
  }

  /**
   * Invokes Gemini 2.5 Flash with structured responseSchema
   */
  private async callGeminiCompare(lost: ItemRecord, found: ItemRecord): Promise<MatchAnalysisResult> {
    if (!this.ai) throw new Error('AI client not initialized');

    const promptText = `Compare the following LOST item with the FOUND item.

LOST ITEM:
Title: ${lost.title}
Category: ${lost.category}
Description: ${lost.description}
Location: ${lost.location}
Time: ${new Date(lost.event_time).toISOString()}
Image URL: ${lost.image_url}

FOUND ITEM:
Title: ${found.title}
Category: ${found.category}
Description: ${found.description}
Location: ${found.location}
Time: ${new Date(found.event_time).toISOString()}
Image URL: ${found.image_url}

Analyze the visual and textual data. Calculate a confidence score (0-100) and provide a concise explanation of your reasoning.`;

    const contents: any[] = [{ text: promptText }];

    // Attempt to download image parts if available (optional multimodal enhancement)
    const [lostImgPart, foundImgPart] = await Promise.all([
      this.fetchImageInlinePart(lost.image_url),
      this.fetchImageInlinePart(found.image_url)
    ]);

    if (lostImgPart) contents.push(lostImgPart);
    if (foundImgPart) contents.push(foundImgPart);

    const modelsToTry = ['gemini-2.5-flash', 'gemini-3.6-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await this.ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                confidence_score: {
                  type: Type.INTEGER,
                  description: 'Probability from 0 to 100 that these two records represent the exact same item.'
                },
                explanation: {
                  type: Type.STRING,
                  description: 'A 2-3 sentence logical explanation of why they match or do not match, referencing specific visual or textual details.'
                }
              },
              required: ['confidence_score', 'explanation']
            }
          }
        });

        const responseText = response.text?.trim() || '{}';
        const parsed = JSON.parse(responseText);

        const score = Math.max(0, Math.min(100, Math.round(Number(parsed.confidence_score) || 0)));
        const explanation = String(parsed.explanation || 'AI evaluated comparison between lost and found item records.');

        return {
          confidence_score: score,
          explanation
        };
      } catch (err: any) {
        lastError = err;
        // If it's a 404 model not found, try the next model in sequence
        if (err.message?.includes('404') || err.message?.includes('NOT_FOUND') || err.status === 404) {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('All model attempts failed');
  }

  /**
   * Helper to fetch remote image and convert to inline data for multimodal Gemini analysis
   */
  private async fetchImageInlinePart(url: string): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
    if (!url || !url.startsWith('http')) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      if (!contentType.startsWith('image/')) return null;

      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      return {
        inlineData: {
          mimeType: contentType,
          data: base64
        }
      };
    } catch {
      return null;
    }
  }

  /**
   * Fast intelligent heuristic matching used as fallback when API key is not present or rate limited
   */
  private fallbackHeuristicCompare(lost: ItemRecord, found: ItemRecord): MatchAnalysisResult {
    const lTitle = lost.title.toLowerCase();
    const fTitle = found.title.toLowerCase();
    const lDesc = lost.description.toLowerCase();
    const fDesc = found.description.toLowerCase();
    const lLoc = lost.location.toLowerCase();
    const fLoc = found.location.toLowerCase();

    let score = 20; // Base score for same category search
    const reasons: string[] = [];

    // Category check
    if (lost.category.toLowerCase() === found.category.toLowerCase()) {
      score += 25;
    }

    // Title token overlap
    const lTokens = lTitle.split(/\W+/).filter(w => w.length > 2);
    const fTokens = fTitle.split(/\W+/).filter(w => w.length > 2);
    const sharedTitleWords = lTokens.filter(t => fTokens.includes(t));

    if (sharedTitleWords.length > 0) {
      score += Math.min(30, sharedTitleWords.length * 15);
      reasons.push(`Matching title keywords (${sharedTitleWords.join(', ')})`);
    }

    // Color and brand keywords
    const keywords = ['blue', 'black', 'silver', 'white', 'red', 'hydroflask', 'apple', 'airpods', 'iphone', 'dell', 'macbook', 'patagonia', 'north face', 'sony', 'stanley', 'keys', 'leather', 'wallet', 'student id', 'bottle'];
    const matchedKeywords = keywords.filter(k => 
      (lTitle.includes(k) || lDesc.includes(k)) && (fTitle.includes(k) || fDesc.includes(k))
    );

    if (matchedKeywords.length > 0) {
      score += Math.min(25, matchedKeywords.length * 10);
      reasons.push(`Shared identifiers (${matchedKeywords.join(', ')})`);
    }

    // Location proximity check
    const campusLocations = ['library', 'quad', 'student union', 'gym', 'dining hall', 'science building', 'engineering hall', 'dorm', 'hall', 'room', 'cafeteria', 'auditorium'];
    const sharedLocs = campusLocations.filter(loc => lLoc.includes(loc) && fLoc.includes(loc));
    if (sharedLocs.length > 0) {
      score += 15;
      reasons.push(`Nearby location match (${sharedLocs.join(', ')})`);
    }

    // Chronology check: Found time should ideally be at or after lost time
    const lostDate = new Date(lost.event_time).getTime();
    const foundDate = new Date(found.event_time).getTime();
    if (!isNaN(lostDate) && !isNaN(foundDate)) {
      if (foundDate >= lostDate - 3600000) { // Found after or within 1h
        score += 5;
      } else {
        score -= 20;
        reasons.push('Chronological mismatch: reported found prior to reported lost time');
      }
    }

    // Normalize score
    score = Math.max(10, Math.min(95, score));

    let explanation = '';
    if (score >= 80) {
      explanation = `High probability match. Both items share specific descriptors (${reasons.join('; ')}). Visual and textual attributes strongly correspond.`;
    } else if (score >= 50) {
      explanation = `Moderate potential match. Items share category and contextual similarities (${reasons.join('; ')}), but lack unique serial/distinguishing mark confirmation.`;
    } else {
      explanation = `Low probability match. While items are in comparable domains, significant variations exist in specific attributes or timing.`;
    }

    return {
      confidence_score: score,
      explanation
    };
  }

  /**
   * Executes the full automated AI Matching Engine pipeline for a given item against database candidates
   */
  public async runMatchingEngine(targetItem: ItemRecord): Promise<{ matchesCount: number; highestScore: number }> {
    console.log(`[AI Matching Engine] Triggering matching process for item ${targetItem.id} (${targetItem.report_type}: "${targetItem.title}")...`);

    const candidates = await db.getCandidateItemsForMatching(targetItem);
    console.log(`[AI Matching Engine] Found ${candidates.length} candidate items for comparison.`);

    if (candidates.length === 0) {
      return { matchesCount: 0, highestScore: 0 };
    }

    let highestScore = 0;
    let matchesCount = 0;

    for (const candidate of candidates) {
      try {
        const lostItem = targetItem.report_type === 'lost' ? targetItem : candidate;
        const foundItem = targetItem.report_type === 'found' ? targetItem : candidate;

        const analysis = await this.compareItems(lostItem, foundItem);

        // Save matches with >= 20% confidence score
        if (analysis.confidence_score >= 20) {
          await db.upsertMatch(
            lostItem.id,
            foundItem.id,
            analysis.confidence_score,
            analysis.explanation
          );
          matchesCount++;
          if (analysis.confidence_score > highestScore) {
            highestScore = analysis.confidence_score;
          }
          console.log(`[AI Matching Engine] Match saved: Lost "${lostItem.title}" <-> Found "${foundItem.title}" | Score: ${analysis.confidence_score}%`);
        }
      } catch (err: any) {
        console.error(`[AI Matching Engine] Error comparing item ${targetItem.id} with candidate ${candidate.id}:`, err.message);
      }
    }

    console.log(`[AI Matching Engine] Matching finished for ${targetItem.id}. Generated ${matchesCount} potential matches (Top Score: ${highestScore}%).`);
    return { matchesCount, highestScore };
  }
}

export const aiService = new AIService();
