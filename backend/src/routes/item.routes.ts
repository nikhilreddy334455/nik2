import { Router } from 'express';
import { ItemController } from '../controllers/item.controller.js';

const router = Router();

// Dashboard stats & seeding
router.get('/stats', ItemController.getStats);
router.post('/seed', ItemController.seedDatabase);

// Items CRUD
router.get('/items', ItemController.getItems);
router.get('/items/:id', ItemController.getItemById);
router.post('/items', ItemController.createItem);
router.patch('/items/:id/status', ItemController.updateStatus);

// AI Matches routes
router.get('/items/:id/matches', ItemController.getItemMatches);
router.post('/trigger-match/:id', ItemController.triggerMatch);

export default router;
