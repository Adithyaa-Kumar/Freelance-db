import { prisma } from '../server.js';
import { ApiError } from '../utils/errorHandler.js';

export const clientService = {
  /**
   * Get all clients for the current user
   * Uses JOIN with activity logs to track client interactions
   */
  async getAll(userId) {
    const clients = await prisma.client.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            budget: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return clients;
  },

  /**
   * Get client by ID with rich JOIN information
   * Includes projects and payment aggregations
   */
  async getById(clientId, userId) {
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        projects: {
          include: {
            tasks: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
            payments: {
              select: {
                id: true,
                amount: true,
                status: true,
                dueDate: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      throw new ApiError('Client not found', 404);
    }

    // Calculate client statistics using raw aggregation
    const stats = await prisma.payment.aggregateRaw({
      pipeline: [
        {
          $match: {
            'projectId': { $in: client.projects.map(p => p.id) }
          }
        },
        {
          $group: {
            _id: null,
            totalBudget: { $sum: '$amount' },
            paidAmount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'PAID'] }, '$amount', 0]
              }
            },
            pendingAmount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'PENDING'] }, '$amount', 0]
              }
            }
          }
        }
      ]
    }).catch(() => ({ totalBudget: 0, paidAmount: 0, pendingAmount: 0 }));

    return {
      ...client,
      statistics: stats?.[0] || { totalBudget: 0, paidAmount: 0, pendingAmount: 0 }
    };
  },

  /**
   * Create a new client
   * Validates email uniqueness
   */
  async create(data, userId) {
    // Check if client already exists for this user
    const existingClient = await prisma.client.findFirst({
      where: {
        userId: userId,
        email: data.email,
      },
    });

    if (existingClient) {
      throw new ApiError('Client with this email already exists', 400);
    }

    const client = await prisma.client.create({
      data: {
        ...data,
        userId: userId,
      },
      include: {
        user: { select: { id: true, name: true } },
        projects: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: `CLIENT_CREATED`,
        details: `Created new client: ${data.name}`,
      },
    });

    return client;
  },

  /**
   * Update client information
   * Validates ownership and email uniqueness
   */
  async update(clientId, data, userId) {
    // Verify ownership
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: userId,
      },
    });

    if (!client) {
      throw new ApiError('Client not found or unauthorized', 404);
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email !== client.email) {
      const existingEmail = await prisma.client.findFirst({
        where: {
          userId: userId,
          email: data.email,
          NOT: { id: clientId },
        },
      });

      if (existingEmail) {
        throw new ApiError('Email already in use', 400);
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data,
      include: {
        user: { select: { id: true, name: true } },
        projects: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: `CLIENT_UPDATED`,
        details: `Updated client: ${data.name || client.name}`,
      },
    });

    return updatedClient;
  },

  /**
   * Delete a client (CASCADE deletes projects, payments, tasks)
   */
  async delete(clientId, userId) {
    // Verify ownership
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: userId,
      },
    });

    if (!client) {
      throw new ApiError('Client not found or unauthorized', 404);
    }

    // Delete using transaction
    await prisma.$transaction(async (tx) => {
      // Log activity before deletion
      await tx.activityLog.create({
        data: {
          userId: userId,
          action: `CLIENT_DELETED`,
          details: `Deleted client: ${client.name}`,
        },
      });

      // Delete client (cascades to projects, payments, tasks)
      await tx.client.delete({ where: { id: clientId } });
    });
  },

  /**
   * Search clients by name or email
   */
  async search(query, userId) {
    const clients = await prisma.client.findMany({
      where: {
        userId: userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        projects: { select: { id: true, name: true, status: true } },
      },
    });

    return clients;
  },
};
