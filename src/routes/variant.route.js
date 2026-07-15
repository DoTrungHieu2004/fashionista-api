const express = require('express');
const router = express.Router();

const createUpload = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');
const variantCtrl = require('../controllers/variant.controller');
const validator = require('../middleware/validator');
const { updateVariantSchema } = require('../validations/variant.validation');

const upload = createUpload('uploads/variants');

router.get('/:id', variantCtrl.getVariant);
router.put(
  '/:id',
  authenticate,
  authorize('STAFF', 'ADMIN'),
  upload.array('images', 5),
  validator(updateVariantSchema),
  variantCtrl.updateVariant
);
router.delete('/:id', authenticate, authorize('STAFF', 'ADMIN'), variantCtrl.deleteVariant);

module.exports = router;
