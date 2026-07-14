const Joi = require('joi');
const { Types } = require('mongoose');

const objectId = Joi.string().custom((value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

const createProductSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(5000).optional().allow(''),
  brandId: objectId.required(),
  categoryIds: Joi.array().items(objectId).min(1).required(),
  gender: Joi.string().valid('MEN', 'WOMEN', 'UNISEX', 'KIDS').required(),
  material: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED').optional(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  description: Joi.string().max(5000).optional().allow(''),
  brandId: objectId.optional(),
  categoryIds: Joi.array().items(objectId).min(1).optional(),
  gender: Joi.string().valid('MEN', 'WOMEN', 'UNISEX', 'KIDS').optional(),
  material: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED').optional(),
});

module.exports = { createProductSchema, updateProductSchema };
