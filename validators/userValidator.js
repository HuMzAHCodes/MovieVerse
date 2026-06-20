const Joi = require('joi');

// =====================
// Profile Update Validator
// =====================
const updateProfileValidator = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min':  'Name must be at least 2 characters',
      'string.max':  'Name must be at most 50 characters',
      'any.required': 'Name is required',
    }),
});

module.exports = {
  updateProfileValidator,
};
