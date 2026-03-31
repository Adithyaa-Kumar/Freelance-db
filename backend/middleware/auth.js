import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import { ApiError } from '../utils/errorHandler.js';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new ApiError('No token provided', 401);
    }

    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(error.statusCode || 401).json({
      success: false,
      message: error.message || 'Unauthorized',
    });
  }
};

export const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
