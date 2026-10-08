const app = require('./app');
const logger = require('./config/logger');

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = server;
