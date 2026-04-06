const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * Global error handling middleware.
 *
 * Normalizes all errors into a consistent response shape.
 * In development, includes the stack trace for debugging.
 *
 * Handles:
 * - ApiError (our custom errors)
 * - Mongoose ValidationError
 * - Mongoose CastError (invalid ObjectId)
 * - MongoDB duplicate key (code 11000)
 * - JWT errors
 * - Unknown / unexpected errors
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose Validation Error
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = `Validation failed: ${messages.join('. ')}`;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // MongoDB Duplicate Key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for '${field}'. This ${field} already exists.`;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please login again.';
  }

  // Log unexpected errors
  if (statusCode === 500) {
    console.error('[ERROR] Unexpected Error:', err);
  }

  // Build response
  const response = {
    success: false,
    message,
    data: null,
  };

  // Include stack trace in development only
  if (env.isDevelopment && statusCode === 500) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
