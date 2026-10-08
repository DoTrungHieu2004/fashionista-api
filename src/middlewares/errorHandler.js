const createError = require('http-errors');
const logger = require('../config/logger');

// 404 handler
const notFoundHandler = (req, res, next) => {
  next(createError(404, 'Not found'));
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  logger.error(`${status} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  res.status(status).json({
    error: { status, message },
  });
};

module.exports = { notFoundHandler, errorHandler };
