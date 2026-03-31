import { clientService } from '../services/clientService.js';
import { asyncHandler, sendResponse } from '../utils/errorHandler.js';
import { ApiError } from '../utils/errorHandler.js';

export const clientController = {
  /**
   * GET /clients - Get all clients
   */
  getAll: asyncHandler(async (req, res) => {
    const clients = await clientService.getAll(req.userId);
    sendResponse(res, 200, clients, `Retrieved ${clients.length} clients`);
  }),

  /**
   * GET /clients/:id - Get single client with statistics
   */
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
      throw new ApiError('Client ID is required', 400);
    }

    const client = await clientService.getById(id, req.userId);
    sendResponse(res, 200, client);
  }),

  /**
   * POST /clients - Create new client
   */
  create: asyncHandler(async (req, res) => {
    const { name, email, company } = req.body;

    // Validation
    if (!name || !email || !company) {
      throw new ApiError('Name, email, and company are required', 400);
    }

    if (!email.includes('@')) {
      throw new ApiError('Invalid email format', 400);
    }

    if (name.length < 2) {
      throw new ApiError('Name must be at least 2 characters', 400);
    }

    const client = await clientService.create(
      { name, email, company },
      req.userId
    );

    sendResponse(res, 201, client, 'Client created successfully');
  }),

  /**
   * PUT /clients/:id - Update client
   */
  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, company } = req.body;

    if (!id) {
      throw new ApiError('Client ID is required', 400);
    }

    // Validate at least one field is provided
    if (!name && !email && !company) {
      throw new ApiError('At least one field must be provided for update', 400);
    }

    // Validate email if provided
    if (email && !email.includes('@')) {
      throw new ApiError('Invalid email format', 400);
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (company) updateData.company = company;

    const client = await clientService.update(id, updateData, req.userId);
    sendResponse(res, 200, client, 'Client updated successfully');
  }),

  /**
   * DELETE /clients/:id - Delete client
   */
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
      throw new ApiError('Client ID is required', 400);
    }

    await clientService.delete(id, req.userId);
    sendResponse(res, 200, null, 'Client deleted successfully');
  }),

  /**
   * GET /clients/search?q=query - Search clients
   */
  search: asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || q.length < 2) {
      throw new ApiError('Search query must be at least 2 characters', 400);
    }

    const clients = await clientService.search(q, req.userId);
    sendResponse(res, 200, clients, `Found ${clients.length} matching clients`);
  }),
};
