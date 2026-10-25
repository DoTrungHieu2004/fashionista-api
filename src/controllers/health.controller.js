'use strict';

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
// Dependency checks (MongoDB, Firebase Admin, NLP model) will be wired here later.
const ready = (req, res) => {
  res.json({
    status: 'ok',
    check: 'readiness',
    timestamp: new Date().toISOString(),
  });
};

module.exports = { health, live, ready };
