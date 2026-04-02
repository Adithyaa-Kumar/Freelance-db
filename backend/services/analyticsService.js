import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/errorHandler.js';

/**
 * Analytics Service with SQLite-compatible queries
 * - Complex JOINs across 3-4 tables
 * - AGGREGATION with GROUP BY and calculations
 * - SUBQUERY patterns for filtering
 * - Financial calculations
 */
export const analyticsService = {
  /**
   * GET /analytics/revenue
   * Monthly revenue breakdown with totals and growth rates
   * AGGREGATION: GROUP BY month, SUM(amount), COUNT(*)
   * Includes: invoice count, paid/unpaid split, avg payment size
   */
  async getMonthlyRevenue(userId, options = {}) {
    const { months = 12 } = options;

    if (months < 1 || months > 60) {
      throw new ApiError('Months must be between 1 and 60', 400);
    }

    try {
      // Get user's client IDs
      const userClients = await prisma.client.findMany({
        where: { userId },
        select: { id: true },
      });
      const clientIds = userClients.map(c => c.id);

      if (clientIds.length === 0) {
        return {
          summary: {
            totalRevenue: 0,
            statusBreakdown: {
              PAID: { count: 0, total: 0, average: 0 },
              PENDING: { count: 0, total: 0, average: 0 },
              OVERDUE: { count: 0, total: 0, average: 0 },
            },
          },
          monthlyBreakdown: [],
          period: { months },
        };
      }

      // Calculate total revenue (paid only)
      const totalRevenue = await prisma.payment.aggregate({
        where: {
          status: 'PAID',
          project: {
            clientId: { in: clientIds },
          },
        },
        _sum: { amount: true },
      });

      // Get status breakdown
      const statusBreakdown = await prisma.payment.groupBy({
        by: ['status'],
        where: {
          project: {
            clientId: { in: clientIds },
          },
          createdAt: {
            gte: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: { amount: true },
        _count: true,
        _avg: { amount: true },
      });

      // Get monthly breakdown (SQLite compatible)
      const cutoffDate = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const monthlyBreakdown = await prisma.$queryRaw`
        SELECT 
          strftime('%Y-%m', p.createdAt) as month,
          COUNT(*) as count,
          SUM(CASE WHEN p.status = 'PAID' THEN p.amount ELSE 0 END) as paid_amount,
          SUM(CASE WHEN p.status = 'PENDING' THEN p.amount ELSE 0 END) as pending_amount,
          SUM(CASE WHEN p.status = 'OVERDUE' THEN p.amount ELSE 0 END) as overdue_amount,
          AVG(p.amount) as avg_amount
        FROM Payment p
        INNER JOIN Project proj ON p.projectId = proj.id
        INNER JOIN Client c ON proj.clientId = c.id
        WHERE c.userId = ${userId}
        AND p.createdAt >= ${cutoffDate}
        GROUP BY strftime('%Y-%m', p.createdAt)
        ORDER BY month DESC
      `;

      return {
        summary: {
          totalRevenue: totalRevenue._sum.amount || 0,
          statusBreakdown: statusBreakdown.reduce(
            (acc, item) => {
              acc[item.status] = {
                count: item._count || 0,
                total: item._sum.amount || 0,
                average: item._avg.amount || 0,
              };
              return acc;
            },
            {
              PAID: { count: 0, total: 0, average: 0 },
              PENDING: { count: 0, total: 0, average: 0 },
              OVERDUE: { count: 0, total: 0, average: 0 },
            }
          ),
        },
        monthlyBreakdown: monthlyBreakdown.map(item => ({
          month: item.month,
          count: Number(item.count) || 0,
          paidAmount: Number(item.paid_amount) || 0,
          pendingAmount: Number(item.pending_amount) || 0,
          overdueAmount: Number(item.overdue_amount) || 0,
          averageAmount: Number(item.avg_amount) || 0,
        })),
        period: { months },
      };
    } catch (error) {
      throw new ApiError(
        `Failed to fetch monthly revenue: ${error.message}`,
        500
      );
    }
  },

  /**
   * GET /analytics/overdue
   * Overdue payment analysis with client and project details
   * SUBQUERY: WHERE dueDate < NOW AND status != 'PAID'
   * COMPLEX JOIN: Payment → Project → Client with aggregations
   */
  async getOverdueAnalysis(userId) {
    try {
      // SUBQUERY pattern for overdue payments
      const userClientIds = await prisma.client
        .findMany({
          where: { userId },
          select: { id: true },
        })
        .then(clients => clients.map(c => c.id));

      if (userClientIds.length === 0) {
        return {
          overdueCount: 0,
          overdueAmount: 0,
          averageDaysOverdue: 0,
          byClient: [],
          details: [],
        };
      }

      // Get all overdue payments with COMPLEX JOIN
      const overduePayments = await prisma.payment.findMany({
        where: {
          status: { not: 'PAID' },
          dueDate: { lt: new Date() },
          project: {
            clientId: { in: userClientIds },
          },
        },
        include: {
          project: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      // Calculate days overdue for each
      const withDaysOverdue = overduePayments.map(payment => {
        const daysOverdue = Math.floor(
          (Date.now() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          ...payment,
          daysOverdue,
        };
      });

      // Aggregate by client (AGGREGATION pattern) - SQLite compatible
      const byClient = await prisma.$queryRaw`
        SELECT 
          c.id,
          c.name,
          COUNT(*) as overdue_count,
          SUM(p.amount) as overdue_amount
        FROM Payment p
        INNER JOIN Project proj ON p.projectId = proj.id
        INNER JOIN Client c ON proj.clientId = c.id
        WHERE c.userId = ${userId}
        AND p.status != 'PAID'
        AND p.dueDate < datetime('now')
        GROUP BY c.id, c.name
        ORDER BY overdue_amount DESC
      `;

      const totalOverdueAmount = withDaysOverdue.reduce(
        (sum, p) => sum + p.amount,
        0
      );
      const avgDaysOverdue =
        withDaysOverdue.length > 0
          ? withDaysOverdue.reduce((sum, p) => sum + p.daysOverdue, 0) /
            withDaysOverdue.length
          : 0;

      return {
        overdueCount: withDaysOverdue.length,
        overdueAmount: totalOverdueAmount,
        averageDaysOverdue: Math.round(avgDaysOverdue),
        byClient: byClient.map(item => ({
          clientId: item.id,
          clientName: item.name,
          overdueCount: Number(item.overdue_count),
          overdueAmount: Number(item.overdue_amount),
          maxDaysOverdue: Math.max(...withDaysOverdue.filter(p => p.project.clientId === item.id).map(p => p.daysOverdue) || [0]),
          avgDaysOverdue: Math.round(
            withDaysOverdue.filter(p => p.project.clientId === item.id).length > 0
              ? withDaysOverdue.filter(p => p.project.clientId === item.id).reduce((sum, p) => sum + p.daysOverdue, 0) /
                withDaysOverdue.filter(p => p.project.clientId === item.id).length
              : 0
          ),
        })),
        details: withDaysOverdue.map(p => ({
          paymentId: p.id,
          amount: p.amount,
          invoiceNumber: p.invoiceNumber,
          dueDate: p.dueDate,
          daysOverdue: p.daysOverdue,
          status: p.status,
          project: p.project.name,
          client: p.project.client.name,
        })),
      };
    } catch (error) {
      throw new ApiError(
        `Failed to fetch overdue analysis: ${error.message}`,
        500
      );
    }
  },

  /**
   * GET /analytics/client-revenue
   * Revenue breakdown by client with detailed metrics
   * COMPLEX JOIN: Client → Projects → Payments with aggregations
   * AGGREGATION: GROUP BY client, SUM(amount), COUNT(*)
   */
  async getClientRevenueAnalysis(userId) {
    try {
      // Get all clients for user
      const userClients = await prisma.client.findMany({
        where: { userId },
        select: { id: true, name: true, email: true },
      });

      if (userClients.length === 0) {
        return {
          clientCount: 0,
          totalRevenue: 0,
          averageClientValue: 0,
          clients: [],
        };
      }

      // COMPLEX JOIN with AGGREGATION pattern - SQLite compatible
      const clientRevenue = await prisma.$queryRaw`
        SELECT 
          c.id,
          c.name,
          c.email,
          COUNT(DISTINCT p.id) as project_count,
          COUNT(DISTINCT pay.id) as payment_count,
          SUM(CASE WHEN pay.status = 'PAID' THEN pay.amount ELSE 0 END) as paid_amount,
          SUM(CASE WHEN pay.status = 'PENDING' THEN pay.amount ELSE 0 END) as pending_amount,
          SUM(pay.amount) as total_amount,
          AVG(pay.amount) as avg_payment,
          MAX(pay.createdAt) as last_payment,
          COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) as completed_tasks,
          COUNT(t.id) as total_tasks
        FROM Client c
        LEFT JOIN Project p ON c.id = p.clientId
        LEFT JOIN Payment pay ON p.id = pay.projectId
        LEFT JOIN Task t ON p.id = t.projectId
        WHERE c.userId = ${userId}
        GROUP BY c.id, c.name, c.email
        ORDER BY COALESCE(total_amount, 0) DESC
      `;

      // Calculate totals
      const totalRevenue = clientRevenue.reduce(
        (sum, c) => sum + (Number(c.total_amount) || 0),
        0
      );
      const avgClientValue =
        clientRevenue.length > 0 ? totalRevenue / clientRevenue.length : 0;

      return {
        clientCount: clientRevenue.length,
        totalRevenue,
        averageClientValue: Math.round(avgClientValue * 100) / 100,
        clients: clientRevenue.map(c => ({
          clientId: c.id,
          clientName: c.name,
          clientEmail: c.email,
          projectCount: Number(c.project_count),
          paymentCount: Number(c.payment_count),
          paidAmount: Number(c.paid_amount) || 0,
          pendingAmount: Number(c.pending_amount) || 0,
          totalRevenue: Number(c.total_amount) || 0,
          averagePayment: Math.round((Number(c.avg_payment) || 0) * 100) / 100,
          lastPayment: c.last_payment,
          taskMetrics: {
            completedTasks: Number(c.completed_tasks),
            totalTasks: Number(c.total_tasks),
            completionRate:
              Number(c.total_tasks) > 0
                ? Math.round(
                    (Number(c.completed_tasks) / Number(c.total_tasks)) * 100
                  )
                : 0,
          },
        })),
      };
    } catch (error) {
      throw new ApiError(
        `Failed to fetch client revenue analysis: ${error.message}`,
        500
      );
    }
  },

  /**
   * GET /analytics/dashboard
   * Complete dashboard with all key metrics
   * Combines all analytics views
   */
  async getDashboardMetrics(userId) {
    try {
      // Run all analytics in parallel
      const [revenue, overdue, clientRevenue] = await Promise.all([
        this.getMonthlyRevenue(userId, { months: 12 }),
        this.getOverdueAnalysis(userId),
        this.getClientRevenueAnalysis(userId),
      ]);

      // Get task completion metrics
      const userClientIds = await prisma.client
        .findMany({
          where: { userId },
          select: { id: true },
        })
        .then(clients => clients.map(c => c.id));

      let taskMetrics = { totalTasks: 0, completedTasks: 0, completionRate: 0 };

      if (userClientIds.length > 0) {
        const tasks = await prisma.task.groupBy({
          by: ['status'],
          where: {
            project: {
              clientId: { in: userClientIds },
            },
          },
          _count: true,
        });

        const totalTasks = tasks.reduce((sum, t) => sum + t._count, 0);
        const completedTasks =
          tasks.find(t => t.status === 'COMPLETED')?._count || 0;

        taskMetrics = {
          totalTasks,
          completedTasks,
          completionRate:
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0,
        };
      }

      return {
        revenue,
        overdue,
        clientRevenue,
        taskMetrics,
        generatedAt: new Date(),
      };
    } catch (error) {
      throw new ApiError(
        `Failed to fetch dashboard metrics: ${error.message}`,
        500
      );
    }
  },
};
