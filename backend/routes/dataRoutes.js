// Data Routes - Smart query exploration endpoints
// No raw SQL exposed to frontend

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import dataController from '../controllers/dataController.js';

const router = express.Router();

/**
 * POST /api/data/query
 * Execute smart query with dynamic SQL generation
 * Body: { entity, filters, include, sort, aggregations, groupBy, search, pagination, viewMode }
 */
router.post('/query', authMiddleware, dataController.executeSmartQuery);

/**
 * GET /api/data/schema
 * Get available entities, fields, filters for UI construction
 */
router.get('/schema', authMiddleware, dataController.getSchema);

/**
 * POST /api/data/favorites
 * Save favorite queries
 */
router.post('/favorites', authMiddleware, dataController.saveFavoriteQuery);

/**
 * GET /api/data/insights/:entity
 * Get insights and recommendations for entity
 */
router.get('/insights/:entity', authMiddleware, dataController.getEntityInsights);

export default router;
