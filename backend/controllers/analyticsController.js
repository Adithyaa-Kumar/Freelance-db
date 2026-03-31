import { analyticsService } from '../services/analyticsService.js';
import { asyncHandler, sendResponse } from '../utils/errorHandler.js';
import { ApiError } from '../utils/errorHandler.js';

/**
 * Analytics Controller
 * Handles analytics endpoints with proper validation and error handling
 */
export const analyticsController = {
  /**
   * GET /analytics/revenue
   * Get monthly revenue breakdown with aggregations
   */
  getMonthlyRevenue: asyncHandler(async (req, res) => {
    const { months = 12 } = req.query;

    const monthsInt = parseInt(months, 10);
    if (isNaN(monthsInt) || monthsInt < 1 || monthsInt > 60) {
      throw new ApiError('Months must be a number between 1 and 60', 400);
    }

    const result = await analyticsService.getMonthlyRevenue(req.userId, {
      months: monthsInt,
    });

    sendResponse(res, 200, result, 'Monthly revenue retrieved successfully');
  }),

  /**
   * GET /analytics/overdue
   * Get overdue payment analysis with client breakdown
   */
  getOverdueAnalysis: asyncHandler(async (req, res) => {
    const result = await analyticsService.getOverdueAnalysis(req.userId);
    sendResponse(res, 200, result, 'Overdue analysis retrieved successfully');
  }),

  /**
   * GET /analytics/client-revenue
   * Get revenue breakdown by client with detailed metrics
   */
  getClientRevenueAnalysis: asyncHandler(async (req, res) => {
    const result = await analyticsService.getClientRevenueAnalysis(req.userId);
    sendResponse(res, 200, result, 'Client revenue analysis retrieved successfully');
  }),

  /**
   * GET /analytics/dashboard
   * Get complete dashboard with all metrics
   */
  getDashboard: asyncHandler(async (req, res) => {
    const result = await analyticsService.getDashboardMetrics(req.userId);
    sendResponse(res, 200, result, 'Dashboard metrics retrieved successfully');
  }),
};
