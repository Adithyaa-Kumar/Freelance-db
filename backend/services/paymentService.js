import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/errorHandler.js';

export const paymentService = {
  /**
   * Get all payments for user's projects
   * COMPLEX JOIN: Projects -> Clients -> User
   */
  async getAll(userId) {
    const payments = await prisma.payment.findMany({
      where: {
        project: {
          client: {
            userId: userId,
          },
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
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  },

  /**
   * Get all payments with status breakdown
   * AGGREGATION: Group by status
   */
  async getAllWithStats(userId) {
    // Get all payments first
    const payments = await this.getAll(userId);

    // Calculate statistics
    const stats = {
      total: payments.length,
      paid: payments.filter(p => p.status === 'PAID').length,
      pending: payments.filter(p => p.status === 'PENDING').length,
      overdue: payments.filter(p => p.status === 'OVERDUE').length,
    };

    // Calculate sums
    const amounts = {
      totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount), 0),
      paidAmount: payments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0),
      pendingAmount: payments
        .filter(p => p.status === 'PENDING')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0),
      overdueAmount: payments
        .filter(p => p.status === 'OVERDUE')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0),
    };

    return {
      payments,
      stats,
      amounts,
    };
  },

  /**
   * Get overdue payments
   * SUBQUERY: WHERE due_date < NOW AND status != PAID
   */
  async getOverdue(userId) {
    const now = new Date();

    const overduePayments = await prisma.payment.findMany({
      where: {
        AND: [
          {
            dueDate: {
              lt: now,
            },
          },
          {
            status: {
              not: 'PAID',
            },
          },
          {
            project: {
              client: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        project: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Calculate days overdue for each payment
    const overdueWithDays = overduePayments.map(payment => ({
      ...payment,
      daysOverdue: Math.ceil(
        (now.getTime() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

    // Calculate totals
    const totals = {
      count: overdueWithDays.length,
      amount: overdueWithDays.reduce((sum, p) => sum + parseFloat(p.amount), 0),
    };

    return {
      payments: overdueWithDays,
      totals,
    };
  },

  /**
   * Get monthly revenue
   * AGGREGATION: GROUP BY month, SUM(amount) WHERE status=PAID
   */
  async getMonthlyRevenue(userId, months = 12) {
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get paid payments from the period
    const payments = await prisma.payment.findMany({
      where: {
        AND: [
          {
            status: 'PAID',
          },
          {
            paidDate: {
              gte: startDate,
              lte: now,
            },
          },
          {
            project: {
              client: {
                userId: userId,
              },
            },
          },
        ],
      },
      select: {
        amount: true,
        paidDate: true,
      },
    });

    // Group by month
    const monthlyData = {};
    payments.forEach(payment => {
      const date = new Date(payment.paidDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += parseFloat(payment.amount);
    });

    // Format response
    const revenue = Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      revenue: parseFloat(amount.toFixed(2)),
    }));

    return {
      revenue: revenue.sort((a, b) => a.month.localeCompare(b.month)),
      total: parseFloat(
        revenue.reduce((sum, r) => sum + r.revenue, 0).toFixed(2)
      ),
    };
  },

  /**
   * Create a new payment
   */
  async create(data, userId) {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        client: {
          userId: userId,
        },
      },
    });

    if (!project) {
      throw new ApiError('Project not found or unauthorized', 404);
    }

    // Check invoice number uniqueness
    const existingInvoice = await prisma.payment.findUnique({
      where: { invoiceNumber: data.invoiceNumber },
    });

    if (existingInvoice) {
      throw new ApiError('Invoice number already exists', 400);
    }

    // Validate amount
    if (parseFloat(data.amount) <= 0) {
      throw new ApiError('Amount must be greater than 0', 400);
    }

    // Validate dates
    const dueDate = new Date(data.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new ApiError('Invalid due date', 400);
    }

    const payment = await prisma.$transaction(async (tx) => {
      // Create payment
      const newPayment = await tx.payment.create({
        data: {
          projectId: data.projectId,
          amount: parseFloat(data.amount),
          currency: data.currency || 'USD',
          invoiceNumber: data.invoiceNumber,
          status: data.status || 'PENDING',
          dueDate: dueDate,
        },
        include: {
          project: {
            include: {
              client: { select: { id: true, name: true } },
            },
          },
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: userId,
          action: 'PAYMENT_CREATED',
          details: `Created payment ${data.invoiceNumber} for ${parseFloat(data.amount)} ${data.currency || 'USD'}`,
        },
      });

      return newPayment;
    });

    return payment;
  },

  /**
   * Update payment status (with transaction for data consistency)
   * TRANSACTION: Update payment + log activity
   */
  async updateStatus(paymentId, newStatus, userId) {
    // Verify payment belongs to user's project
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        project: {
          client: {
            userId: userId,
          },
        },
      },
      include: {
        project: { select: { id: true } },
      },
    });

    if (!payment) {
      throw new ApiError('Payment not found or unauthorized', 404);
    }

    // Validate status
    const validStatuses = ['PAID', 'PENDING', 'OVERDUE'];
    if (!validStatuses.includes(newStatus)) {
      throw new ApiError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    // Use transaction for consistency
    const updatedPayment = await prisma.$transaction(async (tx) => {
      // Update payment
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          paidDate: newStatus === 'PAID' ? new Date() : null,
          updatedAt: new Date(),
        },
        include: {
          project: {
            include: {
              client: { select: { id: true, name: true } },
            },
          },
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: userId,
          action: 'PAYMENT_STATUS_UPDATED',
          details: `Updated payment ${payment.invoiceNumber} status to ${newStatus}`,
        },
      });

      // If payment is marked as PAID, log revenue event
      if (newStatus === 'PAID' && payment.status !== 'PAID') {
        await tx.activityLog.create({
          data: {
            userId: userId,
            action: 'REVENUE_RECEIVED',
            details: `Received payment of ${parseFloat(updated.amount).toFixed(2)} ${updated.currency}`,
          },
        });
      }

      return updated;
    });

    return updatedPayment;
  },

  /**
   * Delete payment
   */
  async delete(paymentId, userId) {
    // Verify ownership
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        project: {
          client: {
            userId: userId,
          },
        },
      },
    });

    if (!payment) {
      throw new ApiError('Payment not found or unauthorized', 404);
    }

    await prisma.$transaction(async (tx) => {
      // Log deletion
      await tx.activityLog.create({
        data: {
          userId: userId,
          action: 'PAYMENT_DELETED',
          details: `Deleted payment ${payment.invoiceNumber}`,
        },
      });

      // Delete payment
      await tx.payment.delete({ where: { id: paymentId } });
    });
  },
};
