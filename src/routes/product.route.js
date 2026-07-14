const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middleware/auth');
const createUpload = require('../middleware/upload');
const productCtrl = require('../controllers/product.controller');
const validator = require('../middleware/validator');
const { createProductSchema, updateProductSchema } = require('../validations/product.validation');

const upload = createUpload('uploads/products');

// Public routes
router.get('/', productCtrl.getProducts);
router.get('/:id', productCtrl.getProduct);

// Staff/Admin only routes
router.post(
  '/',
  authenticate,
  authorize('STAFF', 'ADMIN'),
  upload.array('images', 10),
  validator(createProductSchema),
  productCtrl.createProduct
);

router.put(
  '/:id',
  authenticate,
  authorize('STAFF', 'ADMIN'),
  upload.array('images', 10),
  validator(updateProductSchema),
  productCtrl.updateProduct
);

router.delete('/:id', authenticate, authorize('STAFF', 'ADMIN'), productCtrl.deleteProduct);

module.exports = router;
