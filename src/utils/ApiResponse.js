/**
 * Standardized API response builder.
 * Ensures every response follows the same shape:
 * { success: boolean, message: string, data: any }
 */
class ApiResponse {
  /**
   * @param {boolean} success - Whether the operation succeeded
   * @param {string}  message - Human-readable message
   * @param {*}       data    - Response payload
   */
  constructor(success, message, data = null) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  /**
   * Sends a success response.
   * @param {import('express').Response} res
   * @param {*}      data
   * @param {string} [message='Success']
   * @param {number} [statusCode=200]
   */
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json(new ApiResponse(true, message, data));
  }

  /**
   * Sends a created response (201).
   * @param {import('express').Response} res
   * @param {*}      data
   * @param {string} [message='Created successfully']
   */
  static created(res, data, message = 'Created successfully') {
    return res.status(201).json(new ApiResponse(true, message, data));
  }

  /**
   * Sends an error response.
   * @param {import('express').Response} res
   * @param {string} message
   * @param {number} [statusCode=500]
   * @param {*}      [data=null]
   */
  static error(res, message, statusCode = 500, data = null) {
    return res.status(statusCode).json(new ApiResponse(false, message, data));
  }
}

module.exports = ApiResponse;
