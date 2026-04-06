const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const { ROLE_VALUES, STATUS_VALUES, PAGINATION } = require('../utils/constants');

/**
 * User management service.
 * Contains all business logic for user CRUD operations.
 */
class UserService {
  /**
   * Create a new user.
   *
   * @param {Object} userData - { name, email, password, role, status }
   * @returns {Promise<Object>} Created user document
   * @throws {ApiError} 409 if email is taken
   * @throws {ApiError} 400 if role is invalid
   */
  async createUser(userData) {
    // Validate role assignment
    if (userData.role && !ROLE_VALUES.includes(userData.role)) {
      throw ApiError.badRequest(`Invalid role: ${userData.role}. Allowed: ${ROLE_VALUES.join(', ')}`);
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw ApiError.conflict('A user with this email already exists.');
    }

    const user = await User.create(userData);
    return user;
  }

  /**
   * List all users with optional filtering and pagination.
   *
   * @param {Object} query - { page, limit, role, status }
   * @returns {Promise<{ users: Object[], pagination: Object }>}
   */
  async getAllUsers(query = {}) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      role,
      status,
    } = query;

    // Build filter dynamically
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    };
  }

  /**
   * Get a single user by ID.
   *
   * @param {string} userId - MongoDB ObjectId
   * @returns {Promise<Object>}
   * @throws {ApiError} 404 if user not found
   */
  async getUserById(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    return user;
  }

  /**
   * Update a user's profile.
   *
   * Only allows updating: name, role, status.
   * Email and password changes are intentionally excluded
   * (should go through dedicated flows).
   *
   * @param {string} userId - MongoDB ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated user document
   * @throws {ApiError} 404 if user not found
   * @throws {ApiError} 400 if trying to set an invalid role
   */
  async updateUser(userId, updateData) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    // Validate role change
    if (updateData.role && !ROLE_VALUES.includes(updateData.role)) {
      throw ApiError.badRequest(
        `Invalid role: ${updateData.role}. Allowed: ${ROLE_VALUES.join(', ')}`
      );
    }

    // Validate status change
    if (updateData.status && !STATUS_VALUES.includes(updateData.status)) {
      throw ApiError.badRequest(
        `Invalid status: ${updateData.status}. Allowed: ${STATUS_VALUES.join(', ')}`
      );
    }

    // Only allow whitelisted fields to be updated
    const allowedFields = ['name', 'role', 'status'];
    const sanitizedUpdate = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitizedUpdate[field] = updateData[field];
      }
    }

    if (Object.keys(sanitizedUpdate).length === 0) {
      throw ApiError.badRequest('No valid fields provided for update.');
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: sanitizedUpdate },
      { new: true, runValidators: true }
    );

    return updatedUser;
  }
}

module.exports = new UserService();
