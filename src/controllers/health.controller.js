const mongoose = require('mongoose');
const { getRedisClient } = require('../config/redis');

const check = async (req, res) => {
  const health = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: 'unknown',
    },
  };

  // Check redis
  try {
    const redis = getRedisClient();
    await redis.ping();
    health.services.redis = 'connected';
  } catch (error) {
    health.services.redis = 'disconnected';
  }

  const httpStatus = health.services.mongodb === 'connected' ? 200 : 503;
  res.status(httpStatus).json(health);
};

module.exports = { check };
