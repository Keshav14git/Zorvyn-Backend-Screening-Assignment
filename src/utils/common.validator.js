const Joi = require('joi');
const mongoose = require('mongoose');
const { PAGINATION } = require('./constants');

/**
 * Custom Joi validator for MongoDB ObjectId.
 * Validates both format (24-char hex) and actual ObjectId validity.
 */
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

/**
 * Reusable schema for :id route parameters.
 */
const paramId = {
  params: Joi.object({
    id: objectId.required().messages({
      'any.invalid': 'Invalid ID format',
      'any.required': 'ID parameter is required',
    }),
  }),
};

/**
 * Reusable schema for pagination query parameters.
 */
const paginationQuery = {
  page: Joi.number()
    .integer()
    .min(1)
    .default(PAGINATION.DEFAULT_PAGE)
    .messages({ 'number.min': 'Page must be at least 1' }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': `Limit cannot exceed ${PAGINATION.MAX_LIMIT}`,
    }),
};

module.exports = {
  objectId,
  paramId,
  paginationQuery,
};
