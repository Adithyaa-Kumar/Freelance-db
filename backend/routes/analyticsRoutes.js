import express from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All analytics routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/analytics/revenue
 * @desc    Get monthly revenue breakdown with aggregations
 * @access  Private
 * @query   months - number of months to include (default 12, max 60)
 * 
 * Features:
 * - AGGREGATION: GROUP BY month, SUM(amount), COUNT(*)
 * - Status breakdown (PAID, PENDING, OVERDUE)
 * - Monthly average calculations
 * - Total revenue summary
 */
router.get('/revenue', analyticsController.getMonthlyRevenue);

/**
 * @route   GET /api/analytics/overdue
 * @desc    Get overdue payment analysis with client breakdown
 * @access  Private
 * 
 * Features:
 * - SUBQUERY: WHERE dueDate < NOW AND status != 'PAID'
 * - COMPLEX JOIN: Payment → Project → Client (3-level)
 * - AGGREGATION: GROUP BY client with SUM/AVG/MAX calculations
 * - Days overdue tracking
 * - Client-level summary
 */
router.get('/overdue', analyticsController.getOverdueAnalysis);

/**
 * @route   GET /api/analytics/client-revenue
 * @desc    Get revenue breakdown by client with detailed metrics
 * @access  Private
 * 
 * Features:
 * - COMPLEX JOIN: Client → Projects → Payments → Tasks (4-level)
 * - AGGREGATION: GROUP BY client with multiple calculations
 * - Project count, payment metrics
 * - Task completion rate per client
 * - Last payment tracking
 */
router.get('/client-revenue', analyticsController.getClientRevenueAnalysis);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get complete dashboard with all metrics
 * @access  Private
 * 
 * Combines:
 * - Monthly revenue data
 * - Overdue payment analysis
 * - Client revenue breakdown
 * - Task completion metrics
 */
router.get('/dashboard', analyticsController.getDashboard);

export default router;
