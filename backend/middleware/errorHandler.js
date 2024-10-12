import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

const errorHandler = (err, req, res, _next) => {
  console.log('Error Handler Middleware:', err);
  console.error(err.stack);

  // Log additional request information for debugging
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  console.log('Error Handler Middleware:', err);
  console.error(err);

  if (err instanceof BadRequestError) {
    return res.status(400).json({ message: err.message, errors: err.errors });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ message: err.message });
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).json({ message: err.message });
  }

  // For any other type of error, return a generic 500 Internal Server Error
  res.status(500).json({ message: 'An unexpected error occurred. Please try again later.' });
};

export default errorHandler;
