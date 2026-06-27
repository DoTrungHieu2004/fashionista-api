const Joi = require('joi');

const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Full name must be at least 3 characters',
    'any.required': 'Full name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d|.*[!@#$%^&*(),.?":{}|<>]).+$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base':
        'Password must contain at least one letter and one number or special character',
      'any.required': 'Password is required',
    }),
  phone: Joi.string().optional().allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
