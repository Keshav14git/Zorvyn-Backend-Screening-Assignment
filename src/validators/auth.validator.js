const Joi = require('joi');

/**
 * Validation schemas for authentication endpoints.
 */

const register = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().lowercase().trim().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).max(128).required().messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required',
    }),
    role: Joi.string().valid('admin', 'analyst', 'viewer').default('viewer').messages({
      'any.only': 'Role must be one of: admin, analyst, viewer',
    }),
  }),
};

const login = {
  body: Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),
};

module.exports = {
  register,
  login,
};
