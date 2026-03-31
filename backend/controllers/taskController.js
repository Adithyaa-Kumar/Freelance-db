import { taskService } from '../services/taskService.js';
import { asyncHandler, sendResponse } from '../utils/errorHandler.js';
import { ApiError } from '../utils/errorHandler.js';

export const taskController = {
  /**
   * GET /tasks - Get all tasks
   */
  getAll: asyncHandler(async (req, res) => {
    const includeStats = req.query.stats === 'true';

    if (includeStats) {
      const result = await taskService.getWithStats(req.userId);
      sendResponse(res, 200, result, 'Tasks retrieved with statistics');
    } else {
      const tasks = await taskService.getAll(req.userId);
      sendResponse(res, 200, tasks, `Retrieved ${tasks.length} tasks`);
    }
  }),

  /**
   * GET /tasks/by-status/:status - Get tasks filtered by status
   */
  getByStatus: asyncHandler(async (req, res) => {
    const { status } = req.params;

    const tasks = await taskService.getByStatus(status, req.userId);
    sendResponse(res, 200, tasks, `Retrieved ${tasks.length} ${status} tasks`);
  }),

  /**
   * GET /tasks/project/:projectId - Get tasks for project
   */
  getByProject: asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError('Project ID is required', 400);
    }

    const tasks = await taskService.getByProject(projectId, req.userId);
    sendResponse(res, 200, tasks, `Retrieved ${tasks.length} tasks for project`);
  }),

  /**
   * POST /tasks - Create new task
   */
  create: asyncHandler(async (req, res) => {
    const { projectId, title, deadline, status } = req.body;

    // Validation
    if (!projectId || !title) {
      throw new ApiError('projectId and title are required', 400);
    }

    if (title.length < 3) {
      throw new ApiError('Task title must be at least 3 characters', 400);
    }

    if (title.length > 255) {
      throw new ApiError('Task title must be less than 255 characters', 400);
    }

    const task = await taskService.create(
      {
        projectId,
        title,
        deadline,
        status,
      },
      req.userId
    );

    sendResponse(res, 201, task, 'Task created successfully');
  }),

  /**
   * PUT /tasks/:id/status - Update task status
   */
  updateStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      throw new ApiError('Task ID is required', 400);
    }

    if (!status) {
      throw new ApiError('Status is required', 400);
    }

    const task = await taskService.updateStatus(id, status, req.userId);
    sendResponse(res, 200, task, `Task status updated to ${status}`);
  }),

  /**
   * PUT /tasks/:id - Update task details
   */
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, deadline } = req.body;

    if (!id) {
      throw new ApiError('Task ID is required', 400);
    }

    // Validate at least one field
    if (!title && !deadline) {
      throw new ApiError('At least one field must be provided for update', 400);
    }

    if (title && title.length < 3) {
      throw new ApiError('Task title must be at least 3 characters', 400);
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (deadline) updateData.deadline = deadline;

    const task = await taskService.update(id, updateData, req.userId);
    sendResponse(res, 200, task, 'Task updated successfully');
  }),

  /**
   * DELETE /tasks/:id - Delete task
   */
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
      throw new ApiError('Task ID is required', 400);
    }

    await taskService.delete(id, req.userId);
    sendResponse(res, 200, null, 'Task deleted successfully');
  }),
};
