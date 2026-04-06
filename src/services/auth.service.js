const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * Authentication service.
 * Handles user registration, login, and token generation.
 */
class AuthService {
  /**
   * Register a new user.
   *
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise<{ user: Object, token: string }>}
   * @throws {ApiError} 409 if email already exists
   */
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });

    if (existingUser) {
      throw ApiError.conflict('A user with this email already exists.');
    }

    const user = await User.create(userData);
    const token = this.generateToken(user._id);

    return { user, token };
  }

  /**
   * Authenticate a user by email and password.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: Object, token: string }>}
   * @throws {ApiError} 401 if credentials are invalid
   * @throws {ApiError} 403 if account is inactive
   */
  async login(email, password) {
    // Explicitly select password since it's excluded by default
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (!user.isActive()) {
      throw ApiError.forbidden('Account is inactive. Contact an administrator.');
    }

    const token = this.generateToken(user._id);

    // Remove password from user object before returning
    const userObj = user.toJSON();

    return { user: userObj, token };
  }

  /**
   * Generate a JWT for the given user ID.
   *
   * @param {string} userId - MongoDB ObjectId
   * @returns {string} Signed JWT
   */
  generateToken(userId) {
    return jwt.sign({ id: userId }, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    });
  }
}

module.exports = new AuthService();
