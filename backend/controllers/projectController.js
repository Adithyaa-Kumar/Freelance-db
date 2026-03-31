import { projectService } from '../services/projectService.js';
import { asyncHandler, sendResponse } from '../utils/errorHandler.js';
import { ApiError } from '../utils/errorHandler.js';

export const projectController = {
  getAll: asyncHandler(async (req, res) => {
    const projects = await projectService.getAll(req.userId);
    sendResponse(res, 200, projects);
  }),

  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const project = await projectService.getById(id, req.userId);
    sendResponse(res, 200, project);
  }),

  create: asyncHandler(async (req, res) => {
    const { title, description, budget, deadline } = req.body;

    if (!title || !description || !budget || !deadline) {
      throw new ApiError('Missing required fields', 400);
    }

    const project = await projectService.create(
      {
        title,
        description,
        budget: parseFloat(budget),
        deadline: new Date(deadline),
        status: 'open',
      },
      req.userId
    );

    sendResponse(res, 201, project, 'Project created successfully');
  }),

  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const project = await projectService.update(id, req.body, req.userId);
    sendResponse(res, 200, project, 'Project updated successfully');
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await projectService.delete(id, req.userId);
    sendResponse(res, 200, null, 'Project deleted successfully');
  }),
};
