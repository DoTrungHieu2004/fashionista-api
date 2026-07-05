const express = require('express');
const router = express.Router();

const createUpload = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');
const categoryCtrl = require('../controllers/category.controller');
const validator = require('../middleware/validator');
const validatorCategory = require('../validations/category.validation');

const upload = createUpload('uploads/categories');

// Public routes (no auth)
router.get('/', categoryCtrl.getCategories);
router.get('/:id', categoryCtrl.getCategory);

// Admin only routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  upload.single('image'),
  validator(validatorCategory.createCategorySchema),
  categoryCtrl.createCategory
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  upload.single('image'),
  validator(validatorCategory.updateCategorySchema),
  categoryCtrl.updateCategory
);

router.delete('/:id', authenticate, authorize('ADMIN'), categoryCtrl.deleteCategory);

module.exports = router;
