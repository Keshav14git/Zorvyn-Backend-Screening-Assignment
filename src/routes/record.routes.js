const { Router } = require('express');
const recordController = require('../controllers/record.controller');
const checkAuth = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const recordValidator = require('../validators/record.validator');
const { paramId } = require('../utils/common.validator');
const { ROLES } = require('../utils/constants');

const router = Router();

// All record routes require authentication
router.use(checkAuth);

/**
 * POST /api/records
 * Create a record (admin only).
 */
router.post(
  '/',
  checkRole([ROLES.ADMIN]),
  validate(recordValidator.createRecord),
  recordController.createRecord
);

/**
 * GET /api/records
 * List records with filters (all roles).
 */
router.get(
  '/',
  checkRole([ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER]),
  validate(recordValidator.listRecords),
  recordController.listRecords
);

/**
 * GET /api/records/:id
 * Get a single record (all roles).
 */
router.get(
  '/:id',
  checkRole([ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER]),
  validate(paramId),
  recordController.getRecord
);

/**
 * PATCH /api/records/:id
 * Update a record (admin only).
 */
router.patch(
  '/:id',
  checkRole([ROLES.ADMIN]),
  validate(paramId),
  validate(recordValidator.updateRecord),
  recordController.updateRecord
);

/**
 * DELETE /api/records/:id
 * Soft-delete a record (admin only).
 */
router.delete(
  '/:id',
  checkRole([ROLES.ADMIN]),
  validate(paramId),
  recordController.deleteRecord
);

module.exports = router;
