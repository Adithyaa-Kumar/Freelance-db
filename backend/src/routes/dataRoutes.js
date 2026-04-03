// Data Routes - Smart query exploration endpoints (Development/Mock)
// Returns mock data for Smart Data Explorer UI

import express from 'express';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Schema definition for entities
const SCHEMA = {
  entities: {
    projects: {
      displayName: 'Projects',
      fields: ['id', 'name', 'description', 'budget', 'status', 'priority', 'startDate', 'endDate', 'client'],
      filters: ['status', 'priority'],
      includes: ['client'],
    },
    tasks: {
      displayName: 'Tasks',
      fields: ['id', 'title', 'status', 'deadline', 'project'],
      filters: ['status'],
      includes: ['project'],
    },
    payments: {
      displayName: 'Payments',
      fields: ['id', 'amount', 'status', 'invoiceNumber', 'dueDate', 'project'],
      filters: ['status'],
      includes: ['project'],
    },
    clients: {
      displayName: 'Clients',
      fields: ['id', 'name', 'email', 'company'],
      filters: [],
      includes: [],
    },
  },
  filters: {
    statuses: ['ONGOING', 'COMPLETED', 'CANCELLED', 'PENDING', 'IN_PROGRESS', 'PAID', 'PENDING', 'OVERDUE'],
    priorities: ['LOW', 'MEDIUM', 'HIGH'],
  },
  viewModes: ['detailed', 'summary', 'analytics'],
};

// Mock data for various entities
const mockData = {
  projects: [
    { id: '1', name: 'Website Redesign', status: 'ONGOING', priority: 'HIGH', budget: 5000, client: { id: '1', name: 'Acme Corp' } },
    { id: '2', name: 'Mobile App', status: 'ONGOING', priority: 'HIGH', budget: 15000, client: { id: '2', name: 'TechStart' } },
    { id: '3', name: 'Database Migration', status: 'COMPLETED', priority: 'MEDIUM', budget: 3000, client: { id: '1', name: 'Acme Corp' } },
    { id: '4', name: 'API Development', status: 'ONGOING', priority: 'HIGH', budget: 8000, client: { id: '3', name: 'DataCorp' } },
  ],
  tasks: [
    { id: '1', title: 'Design Mockups', status: 'IN_PROGRESS', deadline: '2024-04-15', project: { id: '1', name: 'Website Redesign' } },
    { id: '2', title: 'Frontend Dev', status: 'IN_PROGRESS', deadline: '2024-05-01', project: { id: '1', name: 'Website Redesign' } },
    { id: '3', title: 'Backend API', status: 'PENDING', deadline: '2024-05-15', project: { id: '2', name: 'Mobile App' } },
    { id: '4', title: 'Testing', status: 'COMPLETED', deadline: '2024-03-31', project: { id: '3', name: 'Database Migration' } },
  ],
  payments: [
    { id: '1', amount: 2500, status: 'PAID', invoiceNumber: 'INV-001', dueDate: '2024-04-01', project: { id: '1', name: 'Website Redesign' } },
    { id: '2', amount: 5000, status: 'PENDING', invoiceNumber: 'INV-002', dueDate: '2024-04-15', project: { id: '2', name: 'Mobile App' } },
    { id: '3', amount: 3000, status: 'PAID', invoiceNumber: 'INV-003', dueDate: '2024-03-31', project: { id: '3', name: 'Database Migration' } },
  ],
  clients: [
    { id: '1', name: 'Acme Corp', email: 'contact@acme.com', company: 'Acme Corp Inc' },
    { id: '2', name: 'TechStart', email: 'info@techstart.com', company: 'TechStart LLC' },
    { id: '3', name: 'DataCorp', email: 'hello@datacorp.com', company: 'DataCorp Solutions' },
  ],
};

// POST /api/data/query
// Execute smart query with filtering, sorting, pagination
router.post('/query', verifyAuth, (req, res) => {
  try {
    const { entity, filters = {}, sort = {}, pagination = { page: 1, limit: 10 } } = req.body;

    if (!entity || !mockData[entity]) {
      return res.status(400).json({
        success: false,
        message: `Invalid entity. Must be one of: ${Object.keys(mockData).join(', ')}`,
      });
    }

    let results = [...mockData[entity]];

    // Apply filters
    if (filters && Object.keys(filters).length > 0) {
      results = results.filter(item => {
        for (const [key, value] of Object.entries(filters)) {
          if (item[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }

    // Apply sorting
    if (sort.field) {
      results.sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        if (sort.order === 'desc') {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    // Apply pagination
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    const paginatedResults = results.slice(start, end);

    // Extract column names from first result or use schema fields
    const columns = paginatedResults.length > 0 
      ? Object.keys(paginatedResults[0])
      : (SCHEMA.entities[entity]?.fields || []);

    return res.status(200).json({
      success: true,
      data: {
        columns: columns,
        rows: paginatedResults,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: results.length,
          totalPages: Math.ceil(results.length / pagination.limit),
        },
        total: results.length,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/data/schema
// Return schema information for Smart Data Explorer UI
router.get('/schema', verifyAuth, (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      schema: SCHEMA,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /api/data/favorites
// Save favorite queries
router.post('/favorites', verifyAuth, (req, res) => {
  try {
    const { name, params } = req.body;

    if (!name || !params) {
      return res.status(400).json({
        success: false,
        message: 'Name and params are required',
      });
    }

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
});

// GET /api/data/insights (query param) or /insights/:entity (path param)
// Get entity-specific insights with recommendations
router.get('/insights', verifyAuth, (req, res) => {
  try {
    const entity = req.query.entity || 'projects';

    const insights = {
      projects: {
        total: 4,
        active: 3,
        completed: 1,
        avgBudget: 7750,
        totalBudget: 31000,
        recommendedActions: [
          'Filter by HIGH priority projects to focus on critical work',
          'Check ONGOING projects for bottlenecks',
          'Archive COMPLETED projects to declutter',
        ],
      },
      tasks: {
        total: 4,
        pending: 1,
        inProgress: 2,
        completed: 1,
        completionRate: 25,
        recommendedActions: [
          'Review pending tasks and prioritize',
          'Assign in-progress tasks to team members',
          'Update task status regularly',
        ],
      },
      payments: {
        total: 3,
        paid: 2,
        pending: 1,
        totalAmount: 10500,
        recommendedActions: [
          'Follow up on pending payments',
          'Track paid invoices for record keeping',
          'Set up payment reminders',
        ],
      },
      clients: {
        total: 3,
        active: 3,
        avgProjectsPerClient: 1.33,
        recommendedActions: [
          'Maintain regular communication with active clients',
          'Track client satisfaction metrics',
          'Schedule periodic check-ins',
        ],
      },
    };

    const entityInsights = insights[entity] || insights.projects;

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
});

// Also handle path param version for compatibility
router.get('/insights/:entity', verifyAuth, (req, res) => {
  try {
    const { entity } = req.params;

    const insights = {
      projects: {
        total: 4,
        active: 3,
        completed: 1,
        avgBudget: 7750,
        totalBudget: 31000,
        recommendedActions: [
          'Filter by HIGH priority projects to focus on critical work',
          'Check ONGOING projects for bottlenecks',
          'Archive COMPLETED projects to declutter',
        ],
      },
      tasks: {
        total: 4,
        pending: 1,
        inProgress: 2,
        completed: 1,
        completionRate: 25,
        recommendedActions: [
          'Review pending tasks and prioritize',
          'Assign in-progress tasks to team members',
          'Update task status regularly',
        ],
      },
      payments: {
        total: 3,
        paid: 2,
        pending: 1,
        totalAmount: 10500,
        recommendedActions: [
          'Follow up on pending payments',
          'Track paid invoices for record keeping',
          'Set up payment reminders',
        ],
      },
      clients: {
        total: 3,
        active: 3,
        avgProjectsPerClient: 1.33,
        recommendedActions: [
          'Maintain regular communication with active clients',
          'Track client satisfaction metrics',
          'Schedule periodic check-ins',
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
});

export default router;
