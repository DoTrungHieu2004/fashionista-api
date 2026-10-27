'use strict';

const path = require('path');
const pino = require('pino');

const env = require('../config/env');

// ---- Reusable single-line JSON file target with rotation ----
const buildFileTarget = (name, level) => {
  const options = {
    file: path.join(env.logDir, name),
    extension: '.jsonl',
    size: env.logRotationSize,
    limit: { count: env.logRetentionCount },
    mkdir: true,
    dateFormat: 'yyyy-MM-dd',
  };

  // Only set frequency if enabled, so `LOG_ROTATION_FREQUENCY=off` means size-only.
  if (env.logRotationFrequency) {
    options.frequency = env.logRotationFrequency;
  }

  return { target: 'pino-roll', level, options };
};

// ---- Build target list ----
const targets = [];

// Console / stdout
if (env.isProduction) {
  // Raw NDJSON on stdout for container log collection (Loki, Fluent Bit, CloudWatch…).
  targets.push({
    target: 'pino/file',
    level: env.logLevel,
    options: { destination: 1 },
  });
} else {
  // Pretty on the terminal in dev
  targets.push({
    target: 'pino-pretty',
    level: env.logLevel,
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  });
}

// File sinks
if (env.logToFile) {
  targets.push(buildFileTarget('app', env.logLevel));
  targets.push(buildFileTarget('error', 'error'));
}

// ---- Logger ----
const logger = pino({
  level: env.logLevel,
  base: { service: 'fashionista-api', env: env.nodeEnv },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
    ],
    censor: '[REDACTED]',
  },
  transport: { targets },
});

module.exports = logger;
