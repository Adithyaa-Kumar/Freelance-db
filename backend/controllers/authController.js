import { authService } from '../services/authService.js';
import { asyncHandler, sendResponse, sendError } from '../utils/errorHandler.js';
import { ApiError } from '../utils/errorHandler.js';

export const authController = {
  signup: asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw new ApiError('Missing required fields', 400);
    }

    const { user, token } = await authService.signup(email, password, name, 'freelancer');
    sendResponse(res, 201, { user, token }, 'User created successfully');
  }),

  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError('Email and password are required', 400);
    }

    const { user, token } = await authService.login(email, password);
    sendResponse(res, 200, { user, token }, 'Login successful');
  }),

  getProfile: asyncHandler(async (req, res) => {
    const user = await authService.getProfile(req.userId);
    sendResponse(res, 200, user);
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    const user = await authService.updateProfile(req.userId, { name, email });
    sendResponse(res, 200, user, 'Profile updated successfully');
  }),
};
