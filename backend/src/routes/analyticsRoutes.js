import express from 'express';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

// Get comprehensive analytics dashboard data
router.get('/dashboard', verifyAuth, (req, res) => {
  try {
    const response = {
      success: true,
      data: {
        // Revenue metrics
        revenue: {
          summary: {
            totalRevenue: 144000,
            projectCount: 12,
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
        // Client revenue metrics
        clientRevenue: {
          summary: {
            totalClients: 5,
          },
          details: [
            { clientId: '1', clientName: 'Acme Corp', revenue: 45000 },
            { clientId: '2', clientName: 'Tech Inc', revenue: 38000 },
            { clientId: '3', clientName: 'Design Co', revenue: 32000 },
            { clientId: '4', clientName: 'Media LLC', revenue: 28000 },
            { clientId: '5', clientName: 'Web Studio', revenue: 22000 },
          ],
        },
        // Task metrics
        taskMetrics: {
          totalTasks: 24,
          completedTasks: 16,
          completionRate: 66.7,
        },
        // Overdue metrics
        overdue: {
          summary: {
            overdueCount: 2,
          },
          list: [
            { projectId: '1', projectName: 'Website Redesign', daysOverdue: 5 },
            { projectId: '4', projectName: 'API Development', daysOverdue: 2 },
          ],
        },
      },
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get analytics stats (legacy endpoint)
router.get('/stats', verifyAuth, (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        totalProjects: 3,
        activeProjects: 2,
        completedProjects: 1,
        totalRevenue: 23000,
        pendingRevenue: 8000,
        avgProjectValue: 7667,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get revenue data
router.get('/revenue', verifyAuth, (req, res) => {
  try {
    res.json({
      success: true,
      data: [
        { month: 'Jan', revenue: 12000, pending: 3000 },
        { month: 'Feb', revenue: 19000, pending: 2000 },
        { month: 'Mar', revenue: 15000, pending: 8000 },
        { month: 'Apr', revenue: 25000, pending: 5000 },
        { month: 'May', revenue: 22000, pending: 6000 },
        { month: 'Jun', revenue: 28000, pending: 4000 },
      ],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
{
      success: true,
      data: [
        { name: 'Client A', value: 5000 },
        { name: 'Client B', value: 15000 },
        { name: 'Client C', value: 3000 },
      ],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      messagee: 'Client C', value: 3000 },
    ]);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

export default router;
