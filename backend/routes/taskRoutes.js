import express from 'express';
import { taskController } from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All task routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with optional statistics
 * @access  Private
 * @query   stats - true/false return statistics breakdown by status
 */
router.get('/', taskController.getAll);

/**
 * @route   GET /api/tasks/by-status/:status
 * @desc    Get tasks filtered by status
 * @access  Private
 * @params  status - TODO, IN_PROGRESS, COMPLETED
 */
router.get('/by-status/:status', taskController.getByStatus);

/**
 * @route   GET /api/tasks/project/:projectId
 * @desc    Get all tasks for a specific project
 * @access  Private
 * @params  projectId - project ID
 */
router.get('/project/:projectId', taskController.getByProject);

/**
 * @route   POST /api/tasks
 * @desc    Create new task
 * @access  Private
 * @body    projectId, title, deadline, status
 */
router.post('/', taskController.create);

/**
 * @route   PUT /api/tasks/:id/status
 * @desc    Update task status with event logging
 * @access  Private
 * @params  id - task ID
 * @body    status - new status (TODO, IN_PROGRESS, COMPLETED)
 */
router.put('/:id/status', taskController.updateStatus);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task details (title, deadline)
 * @access  Private
 * @params  id - task ID
 * @body    title, deadline
 */
router.put('/:id', taskController.update);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task with audit logging
 * @access  Private
 * @params  id - task ID
 */
router.delete('/:id', taskController.delete);

export default router;
