'use strict';

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      requestId: req.id,
    },
  });
};

module.exports = notFoundHandler;
