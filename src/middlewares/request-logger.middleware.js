'use strict';

const { randomUUID } = require('crypto');
const pinoHttp = require('pino-http');

const logger = require('../logging/logger');

const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const id = req.headers['x-request-id'] || randomUUID();
    res.setHeader('x-request-id', id);
    return id;
  },
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});

module.exports = requestLogger;
