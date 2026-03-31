import express from 'express';
import { clientController } from '../controllers/clientController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All client routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/clients
 * @desc    Get all clients for authenticated user
 * @access  Private
 */
router.get('/', clientController.getAll);

/**
 * @route   GET /api/clients/search
 * @desc    Search clients by name, email, or company
 * @access  Private
 * @query   q - Search query string
 */
router.get('/search', clientController.search);

/**
 * @route   GET /api/clients/:id
 * @desc    Get single client with projects, tasks, payments
 * @access  Private
 */
router.get('/:id', clientController.getById);

/**
 * @route   POST /api/clients
 * @desc    Create new client
 * @access  Private
 * @body    name, email, company, budget
 */
router.post('/', clientController.create);

/**
 * @route   PUT /api/clients/:id
 * @desc    Update client details
 * @access  Private
 * @body    name, email, company, budget
 */
router.put('/:id', clientController.update);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Delete client and related records
 * @access  Private
 */
router.delete('/:id', clientController.delete);

export default router;
