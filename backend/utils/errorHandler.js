export class ApiError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const sendResponse = (res, statusCode, data, message = null) => {
  res.status(statusCode).json({
    success: statusCode < 400,
    statusCode,
    message,
    data,
  });
};

export const sendError = (res, error) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    details: error.details || null,
  });
};
