import express from 'express';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Get analytics stats
router.get('/stats', verifyAuth, (req, res) => {
  try {
    res.json({
      totalProjects: 3,
      activeProjects: 2,
      completedProjects: 1,
      totalRevenue: 23000,
      pendingRevenue: 8000,
      avgProjectValue: 7667,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get revenue data
router.get('/revenue', verifyAuth, (req, res) => {
  try {
    res.json([
      { month: 'Jan', revenue: 12000, pending: 3000 },
      { month: 'Feb', revenue: 19000, pending: 2000 },
      { month: 'Mar', revenue: 15000, pending: 8000 },
      { month: 'Apr', revenue: 25000, pending: 5000 },
      { month: 'May', revenue: 22000, pending: 6000 },
      { month: 'Jun', revenue: 28000, pending: 4000 },
    ]);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get project stats
router.get('/projects', verifyAuth, (req, res) => {
  try {
    res.json([
      { name: 'Client A', value: 5000 },
      { name: 'Client B', value: 15000 },
      { name: 'Client C', value: 3000 },
    ]);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

export default router;
