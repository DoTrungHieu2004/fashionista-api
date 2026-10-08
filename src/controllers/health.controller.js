const logger = require('../config/logger');
const { pingFirebase } = require('../config/firebase');

const health = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

const firebase = async (req, res) => {
  const result = await pingFirebase();
  const statusCode = result.ok ? 200 : 503;

  if (!result.ok) {
    logger.warn(`Health check failed for Firebase: ${result.message}`);
  }

  res.status(statusCode).json({
    service: 'firebase',
    status: result.ok ? 'ok' : 'unavailable',
    message: result.message,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { health, firebase };
