const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Dashboard analytics controller.
 * Thin layer that delegates all logic to DashboardService.
 */

/**
 * GET /dashboard/summary
 * Financial summary: totalIncome, totalExpense, netBalance.
 */
const getSummary = async (_req, res, next) => {
  try {
    const summary = await dashboardService.getSummary();
    return ApiResponse.success(res, summary, 'Dashboard summary retrieved.');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /dashboard/category-breakdown
 * Spending breakdown grouped by category.
 */
const getCategoryBreakdown = async (_req, res, next) => {
  try {
    const breakdown = await dashboardService.getCategoryBreakdown();
    return ApiResponse.success(res, breakdown, 'Category breakdown retrieved.');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /dashboard/trends
 * Monthly income vs expense trends.
 */
const getTrends = async (_req, res, next) => {
  try {
    const trends = await dashboardService.getTrends();
    return ApiResponse.success(res, trends, 'Trends retrieved.');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /dashboard/recent
 * Last 5 non-deleted transactions.
 */
const getRecent = async (_req, res, next) => {
  try {
    const transactions = await dashboardService.getRecentTransactions();
    return ApiResponse.success(res, transactions, 'Recent transactions retrieved.');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getSummary,
  getCategoryBreakdown,
  getTrends,
  getRecent,
};
