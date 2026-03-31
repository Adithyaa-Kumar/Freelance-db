import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Health check (no auth required) - GET /api/health
router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected endpoint example - GET /api/health/status
router.get('/status', authMiddleware, (req, res) => {
  res.status(200).json({ 
    status: 'authenticated',
    userId: req.userId,
    timestamp: new Date().toISOString()
  });
});

export default router;
