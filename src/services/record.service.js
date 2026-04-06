const Record = require('../models/record.model');
const ApiError = require('../utils/ApiError');
const { PAGINATION } = require('../utils/constants');

/**
 * Financial record service.
 * Handles CRUD operations with soft-delete support.
 *
 * INVARIANT: All queries exclude soft-deleted records unless
 * explicitly noted. This is enforced at the service layer
 * to prevent leaking deleted data through any controller.
 */
class RecordService {
  /**
   * Create a new financial record.
   *
   * @param {Object} recordData - Record fields from request body
   * @param {string} userId     - ID of the authenticated user creating the record
   * @returns {Promise<Object>} Created record document
   */
  async createRecord(recordData, userId) {
    const record = await Record.create({
      ...recordData,
      createdBy: userId,
    });

    return record;
  }

  /**
   * List financial records with filtering, date ranges, and pagination.
   *
   * @param {Object} query - { page, limit, type, category, startDate, endDate }
   * @returns {Promise<{ records: Object[], pagination: Object }>}
   */
  async getRecords(query = {}) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      type,
      category,
      search,
      startDate,
      endDate,
    } = query;

    // Base filter: always exclude soft-deleted records
    const filter = { isDeleted: false };

    // Apply optional filters
    if (type) filter.type = type;
    if (category) filter.category = { $regex: new RegExp(category, 'i') };

    // Text search filter
    if (search) {
      filter.$or = [
        { note: { $regex: new RegExp(search, 'i') } },
        { category: { $regex: new RegExp(search, 'i') } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    // Execute query and count in parallel for efficiency
    const [records, totalCount] = await Promise.all([
      Record.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email role'),
      Record.countDocuments(filter),
    ]);

    return {
      records,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    };
  }

  /**
   * Get a single record by ID.
   *
   * @param {string} recordId - MongoDB ObjectId
   * @returns {Promise<Object>}
   * @throws {ApiError} 404 if record not found or is deleted
   */
  async getRecordById(recordId) {
    const record = await Record.findOne({
      _id: recordId,
      isDeleted: false,
    }).populate('createdBy', 'name email role');

    if (!record) {
      throw ApiError.notFound('Record not found.');
    }

    return record;
  }

  /**
   * Update a financial record.
   *
   * @param {string} recordId  - MongoDB ObjectId
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated record document
   * @throws {ApiError} 404 if record not found or is deleted
   */
  async updateRecord(recordId, updateData) {
    const record = await Record.findOne({
      _id: recordId,
      isDeleted: false,
    });

    if (!record) {
      throw ApiError.notFound('Record not found.');
    }

    // Only allow whitelisted fields
    const allowedFields = ['amount', 'type', 'category', 'date', 'note'];
    const sanitizedUpdate = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        sanitizedUpdate[field] = updateData[field];
      }
    }

    if (Object.keys(sanitizedUpdate).length === 0) {
      throw ApiError.badRequest('No valid fields provided for update.');
    }

    const updatedRecord = await Record.findByIdAndUpdate(
      recordId,
      { $set: sanitizedUpdate },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    return updatedRecord;
  }

  /**
   * Soft-delete a financial record.
   * Sets isDeleted to true rather than removing the document.
   *
   * @param {string} recordId - MongoDB ObjectId
   * @returns {Promise<Object>} The soft-deleted record
   * @throws {ApiError} 404 if record not found or already deleted
   */
  async softDeleteRecord(recordId) {
    const record = await Record.findOne({
      _id: recordId,
      isDeleted: false,
    });

    if (!record) {
      throw ApiError.notFound('Record not found or already deleted.');
    }

    record.isDeleted = true;
    await record.save();

    return record;
  }
}

module.exports = new RecordService();
