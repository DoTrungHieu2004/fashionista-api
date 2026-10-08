const app = require('./app');
const logger = require('./config/logger');
const { initFirebase } = require('./config/firebase');

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    initFirebase();
    logger.info('Firebase initialised successfully');
  } catch (error) {
    logger.error(`Firebase initialisation failed: ${error.message}`);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
    });
  });
};

startServer();

module.exports = { startServer };
