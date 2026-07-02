const Joi = require('joi');
const { Types } = require('mongoose');

const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  parentCategoryId: Joi.string()
    .custom((value, helpers) => {
      if (value && !Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'ObjectId validation')
    .optional()
    .allow(null),
  isActive: Joi.boolean().optional(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  parentCategoryId: Joi.string()
    .custom((value, helpers) => {
      if (value && !Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'ObjectId validation')
    .optional()
    .allow(null),
  isActive: Joi.boolean().optional(),
});

module.exports = { createCategorySchema, updateCategorySchema };
