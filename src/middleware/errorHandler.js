const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error (with stack)
  logger.error(err.stack || err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: messages.join(', ') },
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      error: { code: 'DUPLICATE_KEY', message: `Duplicate value for field: $${field}` },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid token' } });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: { code: 'TOKEN_EXPIRED', message: 'Token expired' } });
  }

  // Default to 500
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = { errorHandler };
