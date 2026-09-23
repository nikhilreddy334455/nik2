import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

export interface ItemRecord {
  id: string;
  report_type: 'lost' | 'found';
  category: string;
  title: string;
  description: string;
  image_url: string;
  location: string;
  event_time: string | Date;
  contact_info: string;
  status: 'active' | 'resolved';
  created_at: string | Date;
}

export interface MatchRecord {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  confidence_score: number;
  explanation: string;
  created_at: string | Date;
  // Join fields if needed
  matched_item?: ItemRecord;
}

class DatabaseService {
  private pool: Pool | null = null;
  private isPostgresConnected = false;

  // In-memory storage fallback for resilient local demo / standalone execution
  private inMemoryItems: Map<string, ItemRecord> = new Map();
  private inMemoryMatches: Map<string, MatchRecord> = new Map();

  constructor() {
    this.initPool();
  }

  private initPool() {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      try {
        const isSsl = connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') || connectionString.includes('supabase');
        this.pool = new Pool({
          connectionString,
          ssl: isSsl ? { rejectUnauthorized: false } : undefined,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000
        });

        this.pool.on('error', (err) => {
          console.warn('[DB] PostgreSQL pool background error (falling back to resilient mode):', err.message);
          this.isPostgresConnected = false;
        });
      } catch (err: any) {
        console.warn('[DB] Failed to initialize PostgreSQL pool:', err.message);
        this.pool = null;
      }
    }
  }

  public async initialize(): Promise<void> {
    if (!this.pool) {
      console.log('[DB] Running in resilient In-Memory Store mode (no DATABASE_URL configured or reachable).');
      return;
    }

    try {
      const client = await this.pool.connect();
      try {
        console.log('[DB] Connected to PostgreSQL. Initializing tables and schema...');
        await client.query(`
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

          CREATE TABLE IF NOT EXISTS items (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              report_type VARCHAR(10) NOT NULL CHECK (report_type IN ('lost', 'found')),
              category VARCHAR(50) NOT NULL,
              title VARCHAR(255) NOT NULL,
              description TEXT NOT NULL,
              image_url TEXT NOT NULL,
              location VARCHAR(255) NOT NULL,
              event_time TIMESTAMP WITH TIME ZONE NOT NULL,
              contact_info VARCHAR(255) NOT NULL,
              status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS item_matches (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              lost_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
              found_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
              confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
              explanation TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(lost_item_id, found_item_id)
          );

          CREATE INDEX IF NOT EXISTS idx_items_report_type ON items(report_type);
          CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
          CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
          CREATE INDEX IF NOT EXISTS idx_matches_lost_id ON item_matches(lost_item_id);
          CREATE INDEX IF NOT EXISTS idx_matches_found_id ON item_matches(found_item_id);
          CREATE INDEX IF NOT EXISTS idx_matches_confidence ON item_matches(confidence_score DESC);
        `);
        this.isPostgresConnected = true;
        console.log('[DB] PostgreSQL schema ready.');
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.warn(`[DB] Could not connect to live PostgreSQL (${err.message}). Using resilient in-memory database storage.`);
      this.isPostgresConnected = false;
    }
  }

  // Generic query runner using parameterized inputs
  public async query<T extends QueryResultRow = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
    if (this.isPostgresConnected && this.pool) {
      return this.pool.query<T>(text, params);
    }
    throw new Error('PostgreSQL not active, use dedicated service methods.');
  }

  // --- Items Repository Methods ---

  public async createItem(itemData: Omit<ItemRecord, 'id' | 'status' | 'created_at'>): Promise<ItemRecord> {
    const id = uuidv4();
    const status = 'active';
    const createdAt = new Date().toISOString();

    if (this.isPostgresConnected && this.pool) {
      const sql = `
        INSERT INTO items (id, report_type, category, title, description, image_url, location, event_time, contact_info, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;
      const values = [
        id,
        itemData.report_type,
        itemData.category,
        itemData.title,
        itemData.description,
        itemData.image_url,
        itemData.location,
        new Date(itemData.event_time),
        itemData.contact_info,
        status,
        createdAt
      ];

      const res = await this.pool.query<ItemRecord>(sql, values);
      return res.rows[0];
    } else {
      const record: ItemRecord = {
        id,
        report_type: itemData.report_type,
        category: itemData.category,
        title: itemData.title,
        description: itemData.description,
        image_url: itemData.image_url,
        location: itemData.location,
        event_time: itemData.event_time,
        contact_info: itemData.contact_info,
        status,
        created_at: createdAt
      };
      this.inMemoryItems.set(id, record);
      return record;
    }
  }

  public async getItemById(id: string): Promise<ItemRecord | null> {
    if (this.isPostgresConnected && this.pool) {
      const res = await this.pool.query<ItemRecord>('SELECT * FROM items WHERE id = $1', [id]);
      return res.rows[0] || null;
    } else {
      return this.inMemoryItems.get(id) || null;
    }
  }

  public async getItems(filters: {
    type?: 'lost' | 'found';
    category?: string;
    search?: string;
    status?: 'active' | 'resolved';
    limit?: number;
    offset?: number;
  }): Promise<{ items: ItemRecord[]; total: number }> {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    if (this.isPostgresConnected && this.pool) {
      const conditions: string[] = [];
      const values: any[] = [];
      let index = 1;

      if (filters.type) {
        conditions.push(`report_type = $${index++}`);
        values.push(filters.type);
      }
      if (filters.category) {
        conditions.push(`category = $${index++}`);
        values.push(filters.category);
      }
      if (filters.status) {
        conditions.push(`status = $${index++}`);
        values.push(filters.status);
      }
      if (filters.search) {
        conditions.push(`(title ILIKE $${index} OR description ILIKE $${index} OR location ILIKE $${index})`);
        values.push(`%${filters.search}%`);
        index++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      const countRes = await this.pool.query(`SELECT COUNT(*) as total FROM items ${whereClause}`, values);
      const total = parseInt(countRes.rows[0].total, 10);

      const querySql = `
        SELECT * FROM items 
        ${whereClause} 
        ORDER BY created_at DESC 
        LIMIT $${index++} OFFSET $${index++}
      `;
      const queryValues = [...values, limit, offset];
      const itemsRes = await this.pool.query<ItemRecord>(querySql, queryValues);

      return { items: itemsRes.rows, total };
    } else {
      let all = Array.from(this.inMemoryItems.values());

      if (filters.type) {
        all = all.filter(i => i.report_type === filters.type);
      }
      if (filters.category) {
        all = all.filter(i => i.category.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters.status) {
        all = all.filter(i => i.status === filters.status);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        all = all.filter(i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q)
        );
      }

      all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const total = all.length;
      const paginated = all.slice(offset, offset + limit);

      return { items: paginated, total };
    }
  }

  public async getCandidateItemsForMatching(targetItem: ItemRecord): Promise<ItemRecord[]> {
    // If targetItem is 'lost', we want 'found' items in same or relevant categories.
    // If targetItem is 'found', we want 'lost' items.
    const oppositeType = targetItem.report_type === 'lost' ? 'found' : 'lost';

    if (this.isPostgresConnected && this.pool) {
      const sql = `
        SELECT * FROM items 
        WHERE report_type = $1 
          AND status = 'active'
          AND (category = $2 OR category = 'Miscellaneous' OR $2 = 'Miscellaneous')
        ORDER BY created_at DESC
        LIMIT 15;
      `;
      const res = await this.pool.query<ItemRecord>(sql, [oppositeType, targetItem.category]);
      return res.rows;
    } else {
      return Array.from(this.inMemoryItems.values())
        .filter(item =>
          item.id !== targetItem.id &&
          item.report_type === oppositeType &&
          item.status === 'active' &&
          (item.category === targetItem.category || item.category === 'Miscellaneous' || targetItem.category === 'Miscellaneous')
        )
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 15);
    }
  }

  // --- Matches Repository Methods ---

  public async upsertMatch(lostItemId: string, foundItemId: string, confidenceScore: number, explanation: string): Promise<MatchRecord> {
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    if (this.isPostgresConnected && this.pool) {
      const sql = `
        INSERT INTO item_matches (id, lost_item_id, found_item_id, confidence_score, explanation, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (lost_item_id, found_item_id)
        DO UPDATE SET 
          confidence_score = EXCLUDED.confidence_score,
          explanation = EXCLUDED.explanation,
          created_at = EXCLUDED.created_at
        RETURNING *;
      `;
      const res = await this.pool.query<MatchRecord>(sql, [id, lostItemId, foundItemId, confidenceScore, explanation, createdAt]);
      return res.rows[0];
    } else {
      // Find existing match key
      const matchKey = `${lostItemId}_${foundItemId}`;
      const existing = Array.from(this.inMemoryMatches.values()).find(
        m => m.lost_item_id === lostItemId && m.found_item_id === foundItemId
      );

      const record: MatchRecord = {
        id: existing ? existing.id : id,
        lost_item_id: lostItemId,
        found_item_id: foundItemId,
        confidence_score: confidenceScore,
        explanation,
        created_at: createdAt
      };

      this.inMemoryMatches.set(record.id, record);
      return record;
    }
  }

  public async getMatchesForItem(itemId: string): Promise<(MatchRecord & { matched_item: ItemRecord })[]> {
    const item = await this.getItemById(itemId);
    if (!item) return [];

    if (this.isPostgresConnected && this.pool) {
      let sql = '';
      if (item.report_type === 'lost') {
        sql = `
          SELECT m.*, row_to_json(i.*) as matched_item
          FROM item_matches m
          JOIN items i ON m.found_item_id = i.id
          WHERE m.lost_item_id = $1
          ORDER BY m.confidence_score DESC;
        `;
      } else {
        sql = `
          SELECT m.*, row_to_json(i.*) as matched_item
          FROM item_matches m
          JOIN items i ON m.lost_item_id = i.id
          WHERE m.found_item_id = $1
          ORDER BY m.confidence_score DESC;
        `;
      }

      const res = await this.pool.query(sql, [itemId]);
      return res.rows.map(row => ({
        id: row.id,
        lost_item_id: row.lost_item_id,
        found_item_id: row.found_item_id,
        confidence_score: row.confidence_score,
        explanation: row.explanation,
        created_at: row.created_at,
        matched_item: row.matched_item
      }));
    } else {
      const isLost = item.report_type === 'lost';
      const matches: (MatchRecord & { matched_item: ItemRecord })[] = [];

      for (const m of this.inMemoryMatches.values()) {
        if (isLost && m.lost_item_id === itemId) {
          const foundItem = this.inMemoryItems.get(m.found_item_id);
          if (foundItem) {
            matches.push({ ...m, matched_item: foundItem });
          }
        } else if (!isLost && m.found_item_id === itemId) {
          const lostItem = this.inMemoryItems.get(m.lost_item_id);
          if (lostItem) {
            matches.push({ ...m, matched_item: lostItem });
          }
        }
      }

      matches.sort((a, b) => b.confidence_score - a.confidence_score);
      return matches;
    }
  }

  public async updateItemStatus(id: string, status: 'active' | 'resolved'): Promise<ItemRecord | null> {
    if (this.isPostgresConnected && this.pool) {
      const res = await this.pool.query<ItemRecord>(
        'UPDATE items SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );
      return res.rows[0] || null;
    } else {
      const item = this.inMemoryItems.get(id);
      if (!item) return null;
      item.status = status;
      this.inMemoryItems.set(id, item);
      return item;
    }
  }

  public async getDashboardStats(): Promise<{
    totalItems: number;
    lostItems: number;
    foundItems: number;
    resolvedItems: number;
    totalMatches: number;
    highConfidenceMatches: number;
  }> {
    if (this.isPostgresConnected && this.pool) {
      const itemStats = await this.pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE report_type = 'lost' AND status = 'active') as lost_count,
          COUNT(*) FILTER (WHERE report_type = 'found' AND status = 'active') as found_count,
          COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count
        FROM items;
      `);

      const matchStats = await this.pool.query(`
        SELECT 
          COUNT(*) as total_matches,
          COUNT(*) FILTER (WHERE confidence_score >= 80) as high_confidence_count
        FROM item_matches;
      `);

      const iRow = itemStats.rows[0] || {};
      const mRow = matchStats.rows[0] || {};

      return {
        totalItems: parseInt(iRow.total || '0', 10),
        lostItems: parseInt(iRow.lost_count || '0', 10),
        foundItems: parseInt(iRow.found_count || '0', 10),
        resolvedItems: parseInt(iRow.resolved_count || '0', 10),
        totalMatches: parseInt(mRow.total_matches || '0', 10),
        highConfidenceMatches: parseInt(mRow.high_confidence_count || '0', 10)
      };
    } else {
      const items = Array.from(this.inMemoryItems.values());
      const matches = Array.from(this.inMemoryMatches.values());

      return {
        totalItems: items.length,
        lostItems: items.filter(i => i.report_type === 'lost' && i.status === 'active').length,
        foundItems: items.filter(i => i.report_type === 'found' && i.status === 'active').length,
        resolvedItems: items.filter(i => i.status === 'resolved').length,
        totalMatches: matches.length,
        highConfidenceMatches: matches.filter(m => m.confidence_score >= 80).length
      };
    }
  }

  public async clearAllData(): Promise<void> {
    if (this.isPostgresConnected && this.pool) {
      await this.pool.query('TRUNCATE item_matches, items CASCADE;');
    } else {
      this.inMemoryItems.clear();
      this.inMemoryMatches.clear();
    }
  }
}

export const db = new DatabaseService();
