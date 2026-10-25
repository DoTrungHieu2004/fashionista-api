'use strict';

require('dotenv').config();

const toInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const nodeEnv = process.env.NODE_ENV || 'development';

const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: toInt(process.env.PORT, 3000),
  logLevel: process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug'),
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};

module.exports = env;
