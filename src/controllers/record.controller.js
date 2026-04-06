const recordService = require('../services/record.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Financial record controller.
 * Thin layer that delegates all logic to RecordService.
 */

/**
 * POST /records
 * Create a financial record (admin only).
 */
const createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body, req.user._id);
    return ApiResponse.created(res, { record }, 'Record created successfully.');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /records
 * List records with filters and pagination (all roles).
 */
const listRecords = async (req, res, next) => {
  try {
    const result = await recordService.getRecords(req.query);
    return ApiResponse.success(res, result, 'Records retrieved successfully.');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /records/:id
 * Get a single record by ID (all roles).
 */
const getRecord = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);
    return ApiResponse.success(res, { record }, 'Record retrieved successfully.');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /records/:id
 * Update a record (admin only).
 */
const updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body);
    return ApiResponse.success(res, { record }, 'Record updated successfully.');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /records/:id
 * Soft-delete a record (admin only).
 */
const deleteRecord = async (req, res, next) => {
  try {
    await recordService.softDeleteRecord(req.params.id);
    return ApiResponse.success(res, null, 'Record deleted successfully.');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createRecord,
  listRecords,
  getRecord,
  updateRecord,
  deleteRecord,
};
