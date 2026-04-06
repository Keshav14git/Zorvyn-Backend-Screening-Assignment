const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * JWT authentication middleware.
 *
 * Flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Verify and decode the token
 * 3. Load the user from DB (ensures user still exists)
 * 4. Block inactive users globally
 * 5. Attach user to req.user for downstream handlers
 */
const checkAuth = async (req, _res, next) => {
  try {
    // 1. Extract token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, env.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Token has expired. Please login again.');
      }
      throw ApiError.unauthorized('Invalid token.');
    }

    // 3. Fetch user (ensure they still exist in DB)
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists.');
    }

    // 4. Block inactive users
    if (!user.isActive()) {
      throw ApiError.forbidden('Account is inactive. Contact an administrator.');
    }

    // 5. Attach user to request
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = checkAuth;
