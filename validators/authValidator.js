const Joi = require('joi');

// =====================
// Register Validator
// =====================
const registerValidator = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min':  'Name must be at least 2 characters',
      'string.max':  'Name must be at most 50 characters',
      'any.required': 'Name is required',
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min':  'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only':    'Passwords do not match',
      'any.required': 'Please confirm your password',
    }),
});

// =====================
// Login Validator
// =====================
const loginValidator = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

// =====================
// Forgot Password Validator
// =====================
const forgotPasswordValidator = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
});

// =====================
// Reset Password Validator
// =====================
const resetPasswordValidator = Joi.object({
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min':  'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only':    'Passwords do not match',
      'any.required': 'Please confirm your password',
    }),
});

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
};