import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import itemRoutes from './routes/item.routes.js';
import { db } from './services/db.service.js';
import { SEED_ITEMS } from './data/seedData.js';
import { aiService } from './services/ai.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// 1. Security: Strict CORS Configuration
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl) or matched origins
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Not allowed by CORS.'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 2. Security: Payload Limits to prevent DoS attacks
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'Smart Campus Lost & Found API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', itemRoutes);

// 3. Centralized Error Handling Middleware (prevents leaking stack traces)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Server Error Handler]:', err.message || err);

  const statusCode = err.status || err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected server error occurred. Please try again later.'
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message
  });
});

// 4. Server Initialization with DB connection & Auto-Seed
let dbInitPromise: Promise<void> | null = null;

export async function ensureDbReady(): Promise<void> {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      try {
        await db.initialize();
        const stats = await db.getDashboardStats();
        if (stats.totalItems === 0) {
          console.log('[Init] Database is empty. Seeding initial campus items...');
          const createdItems = [];
          for (const item of SEED_ITEMS) {
            const created = await db.createItem(item);
            createdItems.push(created);
          }
          for (const item of createdItems) {
            if (item.report_type === 'lost') {
              await aiService.runMatchingEngine(item).catch(() => {});
            }
          }
          console.log(`[Init] Seeded ${createdItems.length} campus items with AI matches calculated.`);
        }
      } catch (err: any) {
        console.warn('[DB Init Warning]:', err.message);
      }
    })();
  }
  return dbInitPromise;
}

// Serverless middleware to ensure DB is initialized on cold starts
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureDbReady();
  } catch (err) {
    // continue anyway; db.service has in-memory fallback
  }
  next();
});

export async function startServer() {
  try {
    await ensureDbReady();

    // Start listening
    app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🚀 Campus Lost & Found API running on port ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🤖 Gemini AI Matching Engine: Active`);
      console.log(`===================================================`);
    });
  } catch (err: any) {
    console.error('Fatal error starting server:', err.message);
    process.exit(1);
  }
}

// If run directly (not in Vercel serverless environment), start listening
if (!process.env.VERCEL) {
  startServer();
}

export default app;
export { app };
