import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Analytics mock data
router.get('/stats', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      totalProjects: 4,
      activeProjects: 3,
      completedProjects: 1,
      totalRevenue: 38500,
      pendingRevenue: 17500,
      overdueRevenue: 4500,
      avgProjectValue: 9625,
      totalTasks: 10,
      completedTasks: 2,
      inProgressTasks: 3,
      pendingTasks: 5,
      clientCount: 5,
      taskCompletionRate: 20,
    },
  });
});

router.get('/revenue', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: [
      { month: 'Jan', revenue: 12000, pending: 3000, paid: 12000 },
      { month: 'Feb', revenue: 19000, pending: 2000, paid: 19000 },
      { month: 'Mar', revenue: 15000, pending: 8000, paid: 12000 },
      { month: 'Apr', revenue: 25000, pending: 5000, paid: 20000 },
      { month: 'May', revenue: 22000, pending: 6000, paid: 16000 },
      { month: 'Jun', revenue: 28000, pending: 4000, paid: 24000 },
    ],
  });
});

router.get('/dashboard', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      revenue: {
        summary: {
          totalRevenue: 144000,
          projectCount: 12,
          avgProjectBudget: 9625,
        },
        monthlyBreakdown: [
          { month: 'January', paidAmount: 12000, pendingAmount: 3000 },
          { month: 'February', paidAmount: 19000, pendingAmount: 2000 },
          { month: 'March', paidAmount: 15000, pendingAmount: 8000 },
          { month: 'April', paidAmount: 25000, pendingAmount: 5000 },
          { month: 'May', paidAmount: 22000, pendingAmount: 6000 },
          { month: 'June', paidAmount: 28000, pendingAmount: 4000 },
        ],
      },
      clientRevenue: {
        summary: {
          totalClients: 5,
        },
        details: [
          { clientId: '1', clientName: 'Acme Corp', revenue: 45000, projects: 2 },
          { clientId: '2', clientName: 'TechStart', revenue: 38000, projects: 2 },
          { clientId: '3', clientName: 'DataCorp', revenue: 32000, projects: 1 },
          { clientId: '4', clientName: 'Design Co', revenue: 28000, projects: 1 },
          { clientId: '5', clientName: 'RetailCorp', revenue: 22000, projects: 1 },
        ],
      },
      taskMetrics: {
        totalTasks: 10,
        completedTasks: 2,
        inProgressTasks: 3,
        completionRate: 20,
      },
      overdue: {
        summary: {
          overdueCount: 1,
          overdueAmount: 4500,
        },
        list: [
          { projectId: '2', projectName: 'Mobile App', daysOverdue: 20, amount: 4500 },
        ],
      },
    },
  });
});

export default router;
