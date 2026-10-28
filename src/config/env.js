'use strict';

const path = require('path');
require('dotenv').config();

const toInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const nodeEnv = process.env.NODE_ENV || 'development';
const isTest = nodeEnv === 'test';

// 'off'/'none' disables time-based rotation; otherwise accept 'daily' | 'hourly' | ms.
const parseRotationFrequency = (raw) => {
  if (!raw) return 'daily';
  if (raw === 'off' || raw === 'none') return null;
  return raw;
};

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

  // ---- Logging ----
  logDir: process.env.LOG_DIR || path.join(process.cwd(), 'logs'),
  // Tests stay console-only by default to avoid polluting the repo.
  logToFile: !isTest && process.env.LOG_TO_FILE !== 'false',
  logRotationFrequency: parseRotationFrequency(process.env.LOG_ROTATION_FREQUENCY),
  logRotationSize: process.env.LOG_ROTATION_SIZE || '20m',
  logRetentionCount: toInt(process.env.LOG_RETENTION_COUNT, 14),

  // ---- Firebase Admin ----
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || null,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || null,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n') || null,
  },

  // ---- MongoDB ----
  mongo: {
    uri: process.env.MONGODB_URI || null,
    dbName: process.env.MONGODB_DB_NAME || null,
    maxPoolSize: toInt(process.env.MONGODB_MAX_POOL_SIZE, 10),
  },
};

module.exports = env;
