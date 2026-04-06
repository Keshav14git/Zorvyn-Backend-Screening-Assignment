const Joi = require('joi');
const { paginationQuery } = require('../utils/common.validator');

/**
 * Validation schemas for user management endpoints.
 */

const createUser = {
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
      'any.required': 'Password is required',
    }),
    role: Joi.string().valid('admin', 'analyst', 'viewer').default('viewer').messages({
      'any.only': 'Role must be one of: admin, analyst, viewer',
    }),
    status: Joi.string().valid('active', 'inactive').default('active').messages({
      'any.only': 'Status must be one of: active, inactive',
    }),
  }),
};

const updateUser = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(100).messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
    }),
    role: Joi.string().valid('admin', 'analyst', 'viewer').messages({
      'any.only': 'Role must be one of: admin, analyst, viewer',
    }),
    status: Joi.string().valid('active', 'inactive').messages({
      'any.only': 'Status must be one of: active, inactive',
    }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),
};

const listUsers = {
  query: Joi.object({
    ...paginationQuery,
    role: Joi.string().valid('admin', 'analyst', 'viewer').messages({
      'any.only': 'Role filter must be one of: admin, analyst, viewer',
    }),
    status: Joi.string().valid('active', 'inactive').messages({
      'any.only': 'Status filter must be one of: active, inactive',
    }),
  }),
};

module.exports = {
  createUser,
  updateUser,
  listUsers,
};
