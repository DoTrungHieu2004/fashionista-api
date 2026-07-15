const express = require('express');
const router = express.Router({ mergeParams: true });

const createUpload = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');
const variantCtrl = require('../controllers/variant.controller');
const validator = require('../middleware/validator');
const { createVariantSchema } = require('../validations/variant.validation');

const upload = createUpload('uploads/variants');

// Routes for /products/:productId/variants
router.get('/', variantCtrl.getVariantByProduct);
router.post(
  '/',
  authenticate,
  authorize('STAFF', 'ADMIN'),
  upload.array('images', 5),
  validator(createVariantSchema),
  variantCtrl.createVariant
);

module.exports = router;
