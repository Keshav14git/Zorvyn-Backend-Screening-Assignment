const Record = require('../models/record.model');

/**
 * Dashboard analytics service.
 *
 * All methods use MongoDB aggregation pipelines exclusively
 * (no manual loops or in-memory processing).
 *
 * INVARIANT: Every pipeline starts with { $match: { isDeleted: false } }
 * to ensure deleted records are never included in analytics.
 */
class DashboardService {
  /**
   * Get financial summary: totalIncome, totalExpense, netBalance.
   *
   * Uses a single aggregation pass with conditional summing
   * to avoid multiple DB queries.
   *
   * @returns {Promise<Object>} { totalIncome, totalExpense, netBalance }
   */
  async getSummary() {
    const result = await Record.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
        },
      },
      {
        $addFields: {
          netBalance: { $subtract: ['$totalIncome', '$totalExpense'] },
        },
      },
      { $project: { _id: 0 } },
    ]);

    // Return zeros if no records exist
    return result[0] || { totalIncome: 0, totalExpense: 0, netBalance: 0 };
  }

  /**
   * Get spending/income breakdown by category.
   *
   * Groups by category and type, then nests the type breakdown
   * under each category for clean consumption.
   *
   * @returns {Promise<Object[]>} Array of { category, categoryTotal, breakdown: [{ type, total, count }] }
   */
  async getCategoryBreakdown() {
    const result = await Record.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.category',
          breakdown: {
            $push: {
              type: '$_id.type',
              total: '$total',
              count: '$count',
            },
          },
          categoryTotal: { $sum: '$total' },
        },
      },
      { $sort: { categoryTotal: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          categoryTotal: 1,
          breakdown: 1,
        },
      },
    ]);

    return result;
  }

  /**
   * Get monthly income vs expense trends.
   *
   * Groups data by year/month and separates income from expense
   * totals, sorted chronologically.
   *
   * @returns {Promise<Object[]>} Array of { year, month, income, expense, net }
   */
  async getTrends() {
    const result = await Record.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $group: {
          _id: { year: '$_id.year', month: '$_id.month' },
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          income: 1,
          expense: 1,
          net: { $subtract: ['$income', '$expense'] },
        },
      },
    ]);

    return result;
  }

  /**
   * Get the 5 most recent non-deleted transactions.
   *
   * @returns {Promise<Object[]>} Array of record documents
   */
  async getRecentTransactions() {
    const records = await Record.find({ isDeleted: false })
      .sort({ date: -1 })
      .limit(5)
      .populate('createdBy', 'name email');

    return records;
  }
}

module.exports = new DashboardService();
