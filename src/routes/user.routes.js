const { Router } = require('express');
const userController = require('../controllers/user.controller');
const checkAuth = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const userValidator = require('../validators/user.validator');
const { paramId } = require('../utils/common.validator');
const { ROLES } = require('../utils/constants');

const router = Router();

// All user routes require admin access
router.use(checkAuth, checkRole([ROLES.ADMIN]));

/**
 * POST /api/users
 * Create a new user.
 */
router.post(
  '/',
  validate(userValidator.createUser),
  userController.createUser
);

/**
 * GET /api/users
 * List all users with optional filters.
 */
router.get(
  '/',
  validate(userValidator.listUsers),
  userController.listUsers
);

/**
 * PATCH /api/users/:id
 * Update a user's profile.
 */
router.patch(
  '/:id',
  validate(paramId),
  validate(userValidator.updateUser),
  userController.updateUser
);

module.exports = router;
