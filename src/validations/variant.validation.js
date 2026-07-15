const Joi = require('joi');
const { Types } = require('mongoose');

const objectId = Joi.string().custom((value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

const createVariantSchema = Joi.object({
  sku: Joi.string().required(),
  color: Joi.string().required(),
  size: Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL').required(),
  price: Joi.number().min(0).required(),
  compareAtPrice: Joi.number().min(0).optional().allow(null),
  stockQuantity: Joi.number().integer().min(0).required(),
  reservedQuantity: Joi.number().integer().min(0).default(0),
  weight: Joi.number().min(0).required(),
  barcode: Joi.string().required(),
  status: Joi.string().valid('ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED').optional(),
});

const updateVariantSchema = Joi.object({
  sku: Joi.string().optional(),
  color: Joi.string().optional(),
  size: Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL').optional(),
  price: Joi.number().min(0).optional(),
  compareAtPrice: Joi.number().min(0).optional().allow(null),
  stockQuantity: Joi.number().integer().min(0).optional(),
  reservedQuantity: Joi.number().integer().min(0).optional(),
  weight: Joi.number().min(0).optional(),
  barcode: Joi.string().optional(),
  status: Joi.string().valid('ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED').optional(),
});

module.exports = { createVariantSchema, updateVariantSchema };
