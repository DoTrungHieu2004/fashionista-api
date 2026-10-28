'use strict';

const { checkFirebaseHealth } = require('../config/firebase.admin');
const { checkMongoHealth } = require('../config/mongo.client');

// GET /health - overall service status
const health = (req, res) => {
  res.json({
    status: 'ok',
    service: 'fashionista-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

// GET /health/live — liveness probe (process is running)
const live = (req, res) => {
  res.json({
    status: 'ok',
    check: 'liveness',
    timestamp: new Date().toISOString(),
  });
};

// GET /health/ready — readiness probe
const ready = async (req, res) => {
  const [firebase, mongodb] = await Promise.all([checkFirebaseHealth(), checkMongoHealth()]);

  const dependencies = { firebase, mongodb };
  const isReady = Object.values(dependencies).every((dep) => dep.status === 'ok');

  res.json({
    status: isReady ? 'ok' : 'degraded',
    check: 'readiness',
    dependencies,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { health, live, ready };
