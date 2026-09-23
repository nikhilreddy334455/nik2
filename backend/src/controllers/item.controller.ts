import { Request, Response } from 'express';
import { db } from '../services/db.service.js';
import { aiService } from '../services/ai.service.js';
import { ItemSchema, ItemQuerySchema, UpdateStatusSchema } from '../schemas/item.schema.js';
import { SEED_ITEMS } from '../data/seedData.js';

export class ItemController {
  /**
   * GET /api/items
   * List items with optional query filters (type, category, search, status, pagination)
   */
  public static async getItems(req: Request, res: Response): Promise<void> {
    try {
      const parsedQuery = ItemQuerySchema.safeParse(req.query);
      if (!parsedQuery.success) {
        res.status(400).json({ error: 'Invalid query parameters', details: parsedQuery.error.format() });
        return;
      }

      const { type, category, search, status, limit, offset } = parsedQuery.data;
      const result = await db.getItems({
        type,
        category,
        search,
        status,
        limit,
        offset
      });

      res.status(200).json({
        success: true,
        data: result.items,
        pagination: {
          total: result.total,
          limit,
          offset,
          hasMore: offset + result.items.length < result.total
        }
      });
    } catch (error: any) {
      console.error('[ItemController] getItems error:', error.message);
      res.status(500).json({ error: 'Failed to retrieve items. Please try again later.' });
    }
  }

  /**
   * GET /api/items/:id
   * Get single item by UUID
   */
  public static async getItemById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Item ID is required' });
        return;
      }

      const item = await db.getItemById(id);
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }

      res.status(200).json({ success: true, data: item });
    } catch (error: any) {
      console.error('[ItemController] getItemById error:', error.message);
      res.status(500).json({ error: 'Failed to retrieve item details.' });
    }
  }

  /**
   * POST /api/items
   * Create new item with Zod validation, then trigger AI Matching Engine
   */
  public static async createItem(req: Request, res: Response): Promise<void> {
    try {
      const validation = ItemSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed for item submission',
          details: validation.error.flatten().fieldErrors
        });
        return;
      }

      const payload = validation.data;
      const createdItem = await db.createItem(payload);

      // Crucial requirement: Asynchronously trigger the AI matching engine in the background
      // so matches are computed without blocking response or delaying client confirmation
      aiService.runMatchingEngine(createdItem).catch((err) => {
        console.error(`[ItemController] Background AI matching failed for ${createdItem.id}:`, err);
      });

      res.status(201).json({
        success: true,
        message: 'Item reported successfully. AI Matching Engine activated.',
        data: createdItem
      });
    } catch (error: any) {
      console.error('[ItemController] createItem error:', error.message);
      res.status(500).json({ error: 'Failed to save item report.' });
    }
  }

  /**
   * GET /api/items/:id/matches
   * Fetch potential AI matches for an item
   */
  public static async getItemMatches(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await db.getItemById(id);
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }

      const matches = await db.getMatchesForItem(id);
      res.status(200).json({
        success: true,
        data: {
          item,
          matches_count: matches.length,
          matches
        }
      });
    } catch (error: any) {
      console.error('[ItemController] getItemMatches error:', error.message);
      res.status(500).json({ error: 'Failed to retrieve matches for this item.' });
    }
  }

  /**
   * POST /api/trigger-match/:id
   * Manually trigger AI matching for a specific item
   */
  public static async triggerMatch(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await db.getItemById(id);
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }

      const matchSummary = await aiService.runMatchingEngine(item);
      const matches = await db.getMatchesForItem(id);

      res.status(200).json({
        success: true,
        message: 'AI Matching completed successfully.',
        data: {
          evaluated_candidates: matchSummary.matchesCount,
          top_confidence_score: matchSummary.highestScore,
          matches
        }
      });
    } catch (error: any) {
      console.error('[ItemController] triggerMatch error:', error.message);
      res.status(500).json({ error: 'Failed to execute AI matching process.' });
    }
  }

  /**
   * PATCH /api/items/:id/status
   * Mark item as resolved or active
   */
  public static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = UpdateStatusSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: 'Invalid status', details: validation.error.flatten() });
        return;
      }

      const updated = await db.updateItemStatus(id, validation.data.status);
      if (!updated) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }

      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      console.error('[ItemController] updateStatus error:', error.message);
      res.status(500).json({ error: 'Failed to update item status.' });
    }
  }

  /**
   * GET /api/stats
   * Overview metrics for homepage dashboard
   */
  public static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await db.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      console.error('[ItemController] getStats error:', error.message);
      res.status(500).json({ error: 'Failed to calculate campus metrics.' });
    }
  }

  /**
   * POST /api/seed
   * Populates demo campus items and automatically computes AI matches
   */
  public static async seedDatabase(req: Request, res: Response): Promise<void> {
    try {
      console.log('[Seed] Populating campus items...');
      const createdItems = [];

      for (const item of SEED_ITEMS) {
        const created = await db.createItem(item);
        createdItems.push(created);
      }

      // Compute matches for newly created items
      for (const item of createdItems) {
        if (item.report_type === 'lost') {
          await aiService.runMatchingEngine(item);
        }
      }

      const stats = await db.getDashboardStats();
      res.status(200).json({
        success: true,
        message: `Successfully seeded ${createdItems.length} campus items and calculated initial AI match scores.`,
        data: { createdCount: createdItems.length, stats }
      });
    } catch (error: any) {
      console.error('[ItemController] seedDatabase error:', error.message);
      res.status(500).json({ error: 'Failed to seed database.' });
    }
  }
}
