const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Middleware to authenticate a user via JWT.
 * Attaches `req.user` with decoded token payload.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: { code: 'UNAUTHENTICATED', message: 'Missing or invalid token' } });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired token' } });
  }
};

/**
 * Authorize based on roles.
 * Usage: `authorize('ADMIN', 'STAFF')`
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHENTICATED', message: 'Must be authenticated' } });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
