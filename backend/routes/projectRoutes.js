import express from 'express';
import { projectController } from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All project routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/projects
 * @desc    Get all projects for authenticated user
 * @access  Private
 */
router.get('/', projectController.getAll);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project with client, tasks, payments
 * @access  Private
 */
router.get('/:id', projectController.getById);

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Private
 * @body    clientId, name, description, budget, deadline
 */
router.post('/', projectController.create);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project details
 * @access  Private
 * @body    name, description, budget, deadline
 */
router.put('/:id', projectController.update);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project and related records
 * @access  Private
 */
router.delete('/:id', projectController.delete);

export default router;
