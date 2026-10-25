'use strict';

const logger = require('../logging/logger');

const errorHandler = (err, req, res, _next) => {
  const statusCode =
    Number.isInteger(err.statusCode) && err.statusCode >= 400 ? err.statusCode : 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = statusCode >= 500 ? 'Internal server error' : err.message;

  if (statusCode >= 500) {
    logger.error({ err, reqId: req.id }, 'Unhandled request error');
  } else {
    logger.warn({ err, reqId: req.id }, 'Request error');
  }

  res.status(statusCode).json({
    error: { code, message, requestId: req.id },
  });
};

module.exports = errorHandler;
