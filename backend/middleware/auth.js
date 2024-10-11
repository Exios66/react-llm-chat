const jwt = require('jsonwebtoken');
const config = require('config');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    throw new UnauthorizedError('No token, authorization denied');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.get('jwt.secret'));

    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (err) {
    throw new UnauthorizedError('Token is not valid');
  }
};

const authorize = (roles = []) => {
  // roles param can be a single role string (e.g. 'User') 
  // or an array of roles (e.g. ['Admin', 'Moderator'])
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    // authentication and authorization successful
    next();
  };
};

module.exports = {
  auth,
  authorize
};
