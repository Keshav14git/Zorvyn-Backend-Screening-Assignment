const userService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * User management controller.
 * Thin layer that delegates all logic to UserService.
 */

/**
 * POST /users
 * Create a new user (admin only).
 */
const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return ApiResponse.created(res, { user }, 'User created successfully.');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /users
 * List all users with optional filters (admin only).
 */
const listUsers = async (req, res, next) => {
  try {
    const result = await userService.getAllUsers(req.query);
    return ApiResponse.success(res, result, 'Users retrieved successfully.');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /users/:id
 * Update a user's profile (admin only).
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return ApiResponse.success(res, { user }, 'User updated successfully.');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createUser,
  listUsers,
  updateUser,
};
