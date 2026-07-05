const express = require('express');
const router = express.Router();

const createUpload = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');
const brandCtrl = require('../controllers/brand.controller');
const validator = require('../middleware/validator');
const validatorBrand = require('../validations/brand.validation');

const upload = createUpload('uploads/brands');

// Public routes
router.get('/', brandCtrl.getBrands);
router.get('/:id', brandCtrl.getBrand);

// Admin only routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  upload.single('logo'),
  validator(validatorBrand.createBrandSchema),
  brandCtrl.createBrand
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  upload.single('logo'),
  validator(validatorBrand.updateBrandSchema),
  brandCtrl.updateBrand
);

router.delete('/:id', authenticate, authorize('ADMIN'), brandCtrl.deleteBrand);

module.exports = router;
