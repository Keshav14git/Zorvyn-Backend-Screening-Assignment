const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const checkAuth = require('../middleware/auth.middleware');
const checkRole = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

const router = Router();

// All dashboard routes require admin or analyst role
router.use(checkAuth, checkRole([ROLES.ADMIN, ROLES.ANALYST]));

/**
 * GET /api/dashboard/summary
 * Financial overview: totalIncome, totalExpense, netBalance.
 */
router.get('/summary', dashboardController.getSummary);

/**
 * GET /api/dashboard/category-breakdown
 * Income & expense totals grouped by category.
 */
router.get('/category-breakdown', dashboardController.getCategoryBreakdown);

/**
 * GET /api/dashboard/trends
 * Monthly income vs expense trends.
 */
router.get('/trends', dashboardController.getTrends);

/**
 * GET /api/dashboard/recent
 * Last 5 non-deleted transactions.
 */
router.get('/recent', dashboardController.getRecent);

module.exports = router;
