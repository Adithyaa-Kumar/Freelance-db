// Data Controller - Handles data exploration API requests
// Routes user requests through the smart query builder

import QueryBuilder from '../services/queryBuilder.js';

/**
 * POST /api/data/query
 * Main endpoint for smart data exploration
 * 
 * Request body:
 * {
 *   entity: string,
 *   filters: object,
 *   include: array,
 *   sort: { field, order },
 *   groupBy: string,
 *   search: string,
 *   pagination: { page, limit },
 *   viewMode: string
 * }
 */
export const executeSmartQuery = async (req, res) => {
  try {
    const params = req.body;

    // Validate entity
    const validEntities = ['projects', 'tasks', 'payments', 'clients', 'analytics'];
    if (!validEntities.includes(params.entity)) {
      return res.status(400).json({
        success: false,
        message: `Invalid entity. Must be one of: ${validEntities.join(', ')}`,
      });
    }

    // Execute query through smart builder
    const result = await QueryBuilder.execute(params);

    return res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Query execution error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/data/schema
 * Returns available schema information for UI construction
 */
export const getSchema = async (req, res) => {
  try {
    const schema = {
      entities: {
        projects: {
          displayName: 'Projects',
          fields: ['id', 'name', 'description', 'budget', 'status', 'priority', 'startDate', 'endDate'],
          filters: ['status', 'priority', 'clientId', 'budgetMin', 'budgetMax'],
          includes: ['client', 'tasks', 'payments'],
          aggregations: ['taskCount', 'paymentCount', 'totalAmount'],
        },
        tasks: {
          displayName: 'Tasks',
          fields: ['id', 'title', 'status', 'deadline', 'projectId'],
          filters: ['status', 'projectId'],
          includes: ['project'],
          groupBy: ['projectId', 'status'],
        },
        payments: {
          displayName: 'Payments',
          fields: ['id', 'amount', 'status', 'invoiceNumber', 'dueDate', 'paidDate', 'projectId'],
          filters: ['status', 'projectId'],
          includes: ['project'],
          groupBy: ['projectId', 'status'],
        },
        clients: {
          displayName: 'Clients',
          fields: ['id', 'name', 'email', 'company'],
          filters: [],
          includes: ['projects'],
          aggregations: ['projectCount', 'totalRevenue'],
        },
        analytics: {
          displayName: 'Analytics Dashboard',
          metrics: [
            'totalProjects',
            'activeProjects',
            'totalRevenue',
            'activeTasks',
            'topClients',
            'highValueProjects',
          ],
        },
      },
      filters: {
        statuses: ['ONGOING', 'COMPLETED', 'CANCELLED', 'PENDING', 'IN_PROGRESS'],
        priorities: ['LOW', 'MEDIUM', 'HIGH'],
        paymentStatuses: ['PAID', 'PENDING', 'OVERDUE'],
      },
      viewModes: ['detailed', 'summary', 'analytics'],
    };

    return res.status(200).json({
      success: true,
      schema,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/data/favorites
 * Save favorite queries for quick access
 */
export const saveFavoriteQuery = async (req, res) => {
  try {
    const { name, params } = req.body;

    if (!name || !params) {
      return res.status(400).json({
        success: false,
        message: 'Name and params are required',
      });
    }

    // In production, save to database
    // For now, return success
    return res.status(200).json({
      success: true,
      message: 'Query saved as favorite',
      favorite: { name, params, savedAt: new Date() },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/data/insights/:entity
 * Get entity-specific insights and recommendations
 */
export const getEntityInsights = async (req, res) => {
  try {
    const { entity } = req.params;

    const insights = {
      projects: {
        avgProjectCount: 12,
        totalBudget: 250000,
        avgBudget: 20833,
        recommendedActions: [
          'Filter by status to see active projects',
          'Sort by budget to identify high-value work',
          'Group tasks to track progress',
        ],
      },
      tasks: {
        pendingCount: 45,
        inProgressCount: 28,
        completedCount: 102,
        avgDeadlineDaysAway: 7,
        recommendedActions: [
          'Group by project to see workload distribution',
          'Filter by status to focus on active tasks',
          'View completion stats for progress tracking',
        ],
      },
      payments: {
        totalPending: 15000,
        totalOverdue: 2500,
        avgPaymentTime: '14 days',
        recommendedActions: [
          'Identify overdue payments',
          'View summary by project',
          'Track payment status changes',
        ],
      },
      clients: {
        activeClientCount: 8,
        avgProjectsPerClient: 3.5,
        avgClientRevenue: 31250,
        recommendedActions: [
          'View project counts for workload balance',
          'Identify high-value clients',
          'Track revenue by client',
        ],
      },
    };

    const entityInsights = insights[entity] || {};

    return res.status(200).json({
      success: true,
      entity,
      insights: entityInsights,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  executeSmartQuery,
  getSchema,
  saveFavoriteQuery,
  getEntityInsights,
};
