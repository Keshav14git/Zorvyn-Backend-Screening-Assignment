const morgan = require('morgan');
const env = require('../config/env');

/**
 * Configures HTTP request logging.
 * - Development: concise colored output
 * - Production:  Apache combined format for log aggregation tools
 */
const requestLogger = () => {
  if (env.isProduction) {
    return morgan('combined');
  }

  return morgan('dev');
};

module.exports = requestLogger;
