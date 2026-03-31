import { paymentService } from '../services/paymentService.js';
import { asyncHandler, sendResponse } from '../utils/errorHandler.js';
import { ApiError } from '../utils/errorHandler.js';

export const paymentController = {
  /**
   * GET /payments - Get all payments
   */
  getAll: asyncHandler(async (req, res) => {
    const includeStats = req.query.stats === 'true';

    let result;
    if (includeStats) {
      result = await paymentService.getAllWithStats(req.userId);
      sendResponse(res, 200, result, 'Payments retrieved with statistics');
    } else {
      const payments = await paymentService.getAll(req.userId);
      sendResponse(res, 200, payments, `Retrieved ${payments.length} payments`);
    }
  }),

  /**
   * GET /payments/overdue - Get overdue payments with aggregation
   */
  getOverdue: asyncHandler(async (req, res) => {
    const result = await paymentService.getOverdue(req.userId);
    sendResponse(
      res,
      200,
      result,
      `Found ${result.totals.count} overdue payments totaling $${result.totals.amount.toFixed(2)}`
    );
  }),

  /**
   * POST /payments - Create new payment
   */
  create: asyncHandler(async (req, res) => {
    const { projectId, amount, invoiceNumber, dueDate, status, currency } = req.body;

    // Validation
    if (!projectId || !amount || !invoiceNumber || !dueDate) {
      throw new ApiError(
        'projectId, amount, invoiceNumber, and dueDate are required',
        400
      );
    }

    if (isNaN(parseFloat(amount))) {
      throw new ApiError('Amount must be a valid number', 400);
    }

    if (parseFloat(amount) <= 0) {
      throw new ApiError('Amount must be greater than 0', 400);
    }

    if (invoiceNumber.length < 3) {
      throw new ApiError('Invoice number must be at least 3 characters', 400);
    }

    const payment = await paymentService.create(
      {
        projectId,
        amount: parseFloat(amount),
        invoiceNumber,
        dueDate,
        status,
        currency,
      },
      req.userId
    );

    sendResponse(res, 201, payment, 'Payment created successfully');
  }),

  /**
   * PUT /payments/:id/status - Update payment status (with transaction)
   */
  updateStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      throw new ApiError('Payment ID is required', 400);
    }

    if (!status) {
      throw new ApiError('Status is required', 400);
    }

    const payment = await paymentService.updateStatus(id, status, req.userId);
    sendResponse(res, 200, payment, `Payment status updated to ${status}`);
  }),

  /**
   * DELETE /payments/:id - Delete payment
   */
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
      throw new ApiError('Payment ID is required', 400);
    }

    await paymentService.delete(id, req.userId);
    sendResponse(res, 200, null, 'Payment deleted successfully');
  }),

  /**
   * GET /payments/stats/monthly - Get monthly revenue statistics
   */
  getMonthlyRevenue: asyncHandler(async (req, res) => {
    const months = req.query.months ? parseInt(req.query.months) : 12;

    if (months < 1 || months > 60) {
      throw new ApiError('Months must be between 1 and 60', 400);
    }

    const result = await paymentService.getMonthlyRevenue(req.userId, months);
    sendResponse(res, 200, result, 'Monthly revenue retrieved');
  }),
};
