'use strict';

const http = require('http');

const app = require('./app');
const env = require('./config/env');
const logger = require('./logging/logger');

const server = http.createServer(app);

server.listen(env.port, () => {
  logger.info({ port: env.port, env: env.nodeEnv }, 'Fashionista API listening');

  console.log('\x1b[36m%s\x1b[0m', '==================================================');
  console.log('\x1b[32m%s\x1b[0m', ' 🚀 Fashionista API is live and running successfully!');
  console.log(` 🌐 Local URL: \x1b[4m\x1b[35mhttp://localhost:${env.port}\x1b[0m`);
  console.log('\x1b[36m%s\x1b[0m', '==================================================');
});

let shuttingDown = false;

const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Shutdown signal received');

  const forceTimer = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
  forceTimer.unref();

  server.close((err) => {
    clearTimeout(forceTimer);
    if (err) {
      logger.error({ err }, 'Error during server shutdown');
      process.exit(1);
    }
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => shutdown(signal)));

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception');
  shutdown('uncaughtException');
});
