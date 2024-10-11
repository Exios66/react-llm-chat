// backend/utils/logger.js

const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, errors } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Create the logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Console transport
    new transports.Console(),
    // File transport for errors
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // File transport for all logs
    new transports.File({ filename: 'logs/combined.log' })
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' })
  ]
});

// Extend logger to include custom methods
logger.startTimer = () => {
  return {
    done: (message) => {
      const ms = Date.now() - start;
      logger.info(`${message} (${ms}ms)`);
    }
  };
};

logger.logRequest = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
};

logger.logError = (err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  next(err);
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server.');
  // Perform cleanup operations here
  process.exit(0);
});

module.exports = logger;