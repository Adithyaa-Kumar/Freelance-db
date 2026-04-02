import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/errorHandler.js';

export const projectService = {
  async getAll(userId) {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { clientId: userId },
          { freelancerId: userId },
        ],
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        freelancer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return projects;
  },

  async getById(projectId, userId) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { clientId: userId },
          { freelancerId: userId },
        ],
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        freelancer: { select: { id: true, name: true, email: true } },
        tasks: true,
      },
    });

    if (!project) {
      throw new ApiError('Project not found', 404);
    }

    return project;
  },

  async create(data, userId) {
    const project = await prisma.project.create({
      data: {
        ...data,
        clientId: userId,
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });

    return project;
  },

  async update(projectId, data, userId) {
    // Verify ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, clientId: userId },
    });

    if (!project) {
      throw new ApiError('Project not found or unauthorized', 404);
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data,
      include: {
        client: { select: { id: true, name: true, email: true } },
        freelancer: { select: { id: true, name: true, email: true } },
      },
    });

    return updatedProject;
  },

  async delete(projectId, userId) {
    // Verify ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, clientId: userId },
    });

    if (!project) {
      throw new ApiError('Project not found or unauthorized', 404);
    }

    await prisma.project.delete({ where: { id: projectId } });
  },
};
