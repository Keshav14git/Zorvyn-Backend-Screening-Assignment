const ApiError = require('../utils/ApiError');

/**
 * Role-based access control middleware factory.
 *
 * Returns a middleware that checks whether the authenticated
 * user's role is within the allowed set.
 *
 * @param {string[]} allowedRoles - Roles permitted to access the route
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   router.post('/users', checkAuth, checkRole(['admin']), createUser);
 */
const checkRole = (allowedRoles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}.`
        )
      );
    }

    return next();
  };
};

module.exports = checkRole;
