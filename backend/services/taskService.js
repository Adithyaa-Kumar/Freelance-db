import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/errorHandler.js';

export const taskService = {
  /**
   * Get all tasks for user's projects
   * Includes project information via JOIN
   */
  async getAll(userId) {
    const tasks = await prisma.task.findMany({
      where: {
        project: {
          client: {
            userId: userId,
          },
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            client: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ status: 'asc' }, { deadline: 'asc' }],
    });

    return tasks;
  },

  /**
   * Get tasks by project ID
   */
  async getByProject(projectId, userId) {
    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        client: {
          userId: userId,
        },
      },
    });

    if (!project) {
      throw new ApiError('Project not found or unauthorized', 404);
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId,
      },
      orderBy: [{ status: 'asc' }, { deadline: 'asc' }],
    });

    return tasks;
  },

  /**
   * Get tasks with status breakdown
   * AGGREGATION: Group by status
   */
  async getWithStats(userId) {
    const tasks = await this.getAll(userId);

    // Calculate statistics
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      cancelled: tasks.filter(t => t.status === 'CANCELLED').length,
    };

    // Calculate completion percentage
    const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
    const completionPercentage = tasks.length > 0 
      ? parseFloat((completedCount / tasks.length * 100).toFixed(2))
      : 0;

    // Find overdue tasks
    const now = new Date();
    const overdue = tasks.filter(
      t => t.deadline && t.deadline < now && t.status !== 'COMPLETED'
    );

    return {
      tasks,
      stats,
      completionPercentage,
      overdueCount: overdue.length,
      overdueTasks: overdue,
    };
  },

  /**
   * Create a new task
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

    // Validate deadline if provided
    if (data.deadline) {
      const deadline = new Date(data.deadline);
      if (isNaN(deadline.getTime())) {
        throw new ApiError('Invalid deadline date', 400);
      }

      // Optional: Check deadline is not in the past
      if (deadline < new Date()) {
        throw new ApiError('Deadline cannot be in the past', 400);
      }
    }

    const task = await prisma.$transaction(async (tx) => {
      // Create task
      const newTask = await tx.task.create({
        data: {
          projectId: data.projectId,
          title: data.title,
          status: data.status || 'PENDING',
          deadline: data.deadline ? new Date(data.deadline) : null,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              client: { select: { id: true, name: true } },
            },
          },
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: userId,
          action: 'TASK_CREATED',
          details: `Created task "${data.title}" for project ${project.name}`,
        },
      });

      return newTask;
    });

    return task;
  },

  /**
   * Update task status
   */
  async updateStatus(taskId, newStatus, userId) {
    // Verify task belongs to user's project
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          client: {
            userId: userId,
          },
        },
      },
      include: {
        project: { select: { name: true } },
      },
    });

    if (!task) {
      throw new ApiError('Task not found or unauthorized', 404);
    }

    // Validate status
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(newStatus)) {
      throw new ApiError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const updatedTask = await prisma.$transaction(async (tx) => {
      // Update task
      const updated = await tx.task.update({
        where: { id: taskId },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              client: { select: { id: true, name: true } },
            },
          },
        },
      });

      // Log activity
      const action = newStatus === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_STATUS_UPDATED';
      await tx.activityLog.create({
        data: {
          userId: userId,
          action: action,
          details: `Updated task "${task.title}" status to ${newStatus}`,
        },
      });

      return updated;
    });

    return updatedTask;
  },

  /**
   * Update task (title, deadline, etc.)
   */
  async update(taskId, data, userId) {
    // Verify ownership
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          client: {
            userId: userId,
          },
        },
      },
    });

    if (!task) {
      throw new ApiError('Task not found or unauthorized', 404);
    }

    // Validate deadline if provided
    if (data.deadline) {
      const deadline = new Date(data.deadline);
      if (isNaN(deadline.getTime())) {
        throw new ApiError('Invalid deadline date', 400);
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: { select: { id: true, name: true } },
          },
        },
      },
    });

    return updatedTask;
  },

  /**
   * Delete task
   */
  async delete(taskId, userId) {
    // Verify ownership
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          client: {
            userId: userId,
          },
        },
      },
    });

    if (!task) {
      throw new ApiError('Task not found or unauthorized', 404);
    }

    await prisma.$transaction(async (tx) => {
      // Log deletion
      await tx.activityLog.create({
        data: {
          userId: userId,
          action: 'TASK_DELETED',
          details: `Deleted task "${task.title}"`,
        },
      });

      // Delete task
      await tx.task.delete({ where: { id: taskId } });
    });
  },

  /**
   * Get tasks by status
   */
  async getByStatus(status, userId) {
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const tasks = await prisma.task.findMany({
      where: {
        status: status,
        project: {
          client: {
            userId: userId,
          },
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { deadline: 'asc' },
    });

    return tasks;
  },
};
