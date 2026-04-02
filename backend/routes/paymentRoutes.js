import express from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All payment routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/payments
 * @desc    Get all payments with optional statistics
 * @access  Private
 * @query   stats - true/false return statistics breakdown
 */
router.get('/', paymentController.getAll);

/**
 * @route   GET /api/payments/stats/monthly
 * @desc    Get monthly revenue aggregation
 * @access  Private
 * @query   months - number of months to include (default 12, max 60)
 */
router.get('/stats/monthly', paymentController.getMonthlyRevenue);

/**
 * @route   GET /api/payments/overdue
 * @desc    Get all overdue payments with analysis
 * @access  Private
 */
router.get('/overdue', paymentController.getOverdue);

/**
 * @route   POST /api/payments
 * @desc    Create new payment
 * @access  Private
 * @body    projectId, amount, dueDate, invoiceNumber, status
 */
router.post('/', paymentController.create);

/**
 * @route   PUT /api/payments/:id/status
 * @desc    Update payment status (PAID, PENDING, OVERDUE)
 * @access  Private
 * @body    status - new payment status
 */
router.put('/:id/status', paymentController.updateStatus);

/**
 * @route   DELETE /api/payments/:id
 * @desc    Delete payment with audit logging
 * @access  Private
 */
router.delete('/:id', paymentController.delete);

export default router;
