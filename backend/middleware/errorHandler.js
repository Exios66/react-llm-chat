const config = require('config');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`);
  logger.debug(err.stack);

  // Set default error status and message
  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = Object.values(err.errors).map(error => error.message).join(', ');
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorMessage = 'Unauthorized: Invalid token';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    errorMessage = 'Forbidden: Insufficient permissions';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorMessage = 'Resource not found';
  }

  // Send error response
  res.status(statusCode).json({
    error: {
      message: errorMessage,
      status: statusCode,
      timestamp: new Date().toISOString(),
    }
  });

  // If in development, send stack trace
  if (config.get('env') === 'development') {
    res.json({
      ...res.json,
      stack: err.stack
    });
  }

  next();
};

module.exports = errorHandler;
