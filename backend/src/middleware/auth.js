// Error Handling Middleware
export const errorMiddleware = (err, req, res, next) => {
  console.error('[Error]', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
};

// Auth Token Verification Middleware
export const verifyAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No authorization token',
    });
  }
  
  // In development, accept any token format
  req.user = { id: '1', email: 'test@example.com' };
  next();
};
