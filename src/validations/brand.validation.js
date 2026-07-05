const Joi = require('joi');

const createBrandSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(1000).optional().allow(''),
  isActive: Joi.boolean().optional(),
});

const updateBrandSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(1000).optional().allow(''),
  isActive: Joi.boolean().optional(),
});

module.exports = { createBrandSchema, updateBrandSchema };
