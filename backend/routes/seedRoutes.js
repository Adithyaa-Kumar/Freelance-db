// Seed Routes - Data import and initialization endpoints

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { seedDatabase } from '../controllers/seedController.js';

const router = express.Router();

/**
 * POST /api/seed/import
 * Import/seed sample data for development and testing
 * Only available in dev mode
 */
router.post('/import', authMiddleware, seedDatabase);

export default router;
