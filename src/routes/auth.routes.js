const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const checkAuth = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const authValidator = require('../validators/auth.validator');
const { ROLES } = require('../utils/constants');

const router = Router();

/**
 * POST /api/auth/login
 * Public — authenticate and receive JWT.
 */
router.post(
  '/login',
  validate(authValidator.login),
  authController.login
);

/**
 * POST /api/auth/register
 * Admin only — register a new user.
 */
router.post(
  '/register',
  checkAuth,
  checkRole([ROLES.ADMIN]),
  validate(authValidator.register),
  authController.register
);

module.exports = router;
