const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Authentication controller.
 * Thin layer that delegates all logic to AuthService.
 */

/**
 * POST /auth/register
 * Register a new user (admin only).
 */
const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    return ApiResponse.created(res, { user, token }, 'User registered successfully.');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /auth/login
 * Authenticate a user and return a JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login(email, password);
    return ApiResponse.success(res, { user, token }, 'Login successful.');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
};
