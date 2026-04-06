const Joi = require('joi');
const { paginationQuery } = require('../utils/common.validator');

/**
 * Validation schemas for financial record endpoints.
 */

const createRecord = {
  body: Joi.object({
    amount: Joi.number().positive().precision(2).required().messages({
      'number.positive': 'Amount must be greater than 0',
      'number.base': 'Amount must be a number',
      'any.required': 'Amount is required',
    }),
    type: Joi.string().valid('income', 'expense').required().messages({
      'any.only': 'Type must be either income or expense',
      'any.required': 'Type is required',
    }),
    category: Joi.string().trim().max(50).required().messages({
      'string.max': 'Category cannot exceed 50 characters',
      'any.required': 'Category is required',
    }),
    date: Joi.date().iso().required().messages({
      'date.format': 'Date must be a valid ISO date',
      'any.required': 'Date is required',
    }),
    note: Joi.string().trim().max(500).allow('').default('').messages({
      'string.max': 'Note cannot exceed 500 characters',
    }),
  }),
};

const updateRecord = {
  body: Joi.object({
    amount: Joi.number().positive().precision(2).messages({
      'number.positive': 'Amount must be greater than 0',
      'number.base': 'Amount must be a number',
    }),
    type: Joi.string().valid('income', 'expense').messages({
      'any.only': 'Type must be either income or expense',
    }),
    category: Joi.string().trim().max(50).messages({
      'string.max': 'Category cannot exceed 50 characters',
    }),
    date: Joi.date().iso().messages({
      'date.format': 'Date must be a valid ISO date',
    }),
    note: Joi.string().trim().max(500).allow('').messages({
      'string.max': 'Note cannot exceed 500 characters',
    }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),
};

const listRecords = {
  query: Joi.object({
    ...paginationQuery,
    type: Joi.string().valid('income', 'expense').messages({
      'any.only': 'Type filter must be either income or expense',
    }),
    category: Joi.string().trim().messages({}),
    search: Joi.string().trim().max(100).messages({
      'string.max': 'Search query cannot exceed 100 characters',
    }),
    startDate: Joi.date().iso().messages({
      'date.format': 'Start date must be a valid ISO date',
    }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
      'date.format': 'End date must be a valid ISO date',
      'date.min': 'End date must be after start date',
    }),
  }),
};

module.exports = {
  createRecord,
  updateRecord,
  listRecords,
};
