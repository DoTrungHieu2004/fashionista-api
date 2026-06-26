const winston = require('winston');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (with colors)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} ${level}: ${message}`;
    if (stack) log += `\n${stack}`;
    if (Object.keys(meta).length) log += `\n${JSON.stringify(meta, null, 2)}`;
    return log;
  })
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'fashionista-api' },
  transports: [
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5 MB
      maxFiles: 5,
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// If not in production, also log to the console with colored output
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({ format: consoleFormat }));
}

module.exports = logger;
