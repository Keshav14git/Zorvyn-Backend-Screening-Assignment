const ApiError = require('../utils/ApiError');

/**
 * Generic Joi validation middleware factory.
 *
 * Validates one or more request properties (body, query, params)
 * against a Joi schema object.
 *
 * @param {import('joi').ObjectSchema} schema - Joi schema with keys: body, query, params
 * @returns {import('express').RequestHandler}
 *
 * @example
 *   // In validator file:
 *   const createUser = Joi.object({
 *     body: Joi.object({ name: Joi.string().required() })
 *   });
 *
 *   // In route:
 *   router.post('/users', validate(createUser), controller.create);
 */
const validate = (schema) => {
  return (req, _res, next) => {
    const validationErrors = [];

    // Validate each request segment defined in the schema
    for (const segment of ['body', 'query', 'params']) {
      if (!schema[segment]) continue;

      const { error, value } = schema[segment].validate(req[segment], {
        abortEarly: false,       // Collect all errors, not just the first
        stripUnknown: true,      // Remove fields not in schema
        convert: true,           // Allow type coercion (e.g., string → number)
      });

      if (error) {
        const messages = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, ''),
        }));
        validationErrors.push(...messages);
      } else {
        // Replace request data with validated & sanitized values
        req[segment] = value;
      }
    }

    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.map((e) => e.message).join('. ');
      return next(new ApiError(400, `Validation failed: ${errorMessage}`));
    }

    return next();
  };
};

module.exports = validate;
