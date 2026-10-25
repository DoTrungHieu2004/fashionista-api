'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const logger = require('./logging/logger');
const requestLogger = require('./middlewares/request-logger.middleware');
const notFoundHandler = require('./middlewares/not-found.middleware');
const errorHandler = require('./middlewares/error.middleware');
const apiRouter = require('./routes/_index');
const healthRoutes = require('./routes/health.route');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

// Global middleware
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins.length ? env.corsOrigins : false,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(requestLogger);

// Baseline rate limit - tighter limits will be added per route later.
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn({ reqId: req.id }, 'Rate limit exceeded');
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests, please try again later.',
          requestId: req.id,
        },
      });
    },
  })
);

// Unversioned infrastructure endpoints
app.use('/health', healthRoutes);

// Versioned business API
app.use('/api/v1', apiRouter);

// Fallbacks
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
