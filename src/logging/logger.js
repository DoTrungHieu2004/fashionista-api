'use strict';

const pino = require('pino');

const env = require('../config/env');

// Pretty-print only in non-production. Production emits newline-delimited JSON.
const transport = env.isProduction
  ? undefined
  : {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    };

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
  transport,
});

module.exports = logger;
