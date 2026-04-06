/**
 * Application-wide constants.
 * Centralizes all enums and magic strings to prevent typos
 * and enable refactoring from a single location.
 */

const ROLES = Object.freeze({
  ADMIN: 'admin',
  ANALYST: 'analyst',
  VIEWER: 'viewer',
});

const ROLE_VALUES = Object.values(ROLES);

const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
});

const STATUS_VALUES = Object.values(USER_STATUS);

const RECORD_TYPES = Object.freeze({
  INCOME: 'income',
  EXPENSE: 'expense',
});

const RECORD_TYPE_VALUES = Object.values(RECORD_TYPES);

const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
});

module.exports = {
  ROLES,
  ROLE_VALUES,
  USER_STATUS,
  STATUS_VALUES,
  RECORD_TYPES,
  RECORD_TYPE_VALUES,
  PAGINATION,
};
