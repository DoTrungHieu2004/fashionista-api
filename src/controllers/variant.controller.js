const fs = require('fs').promises;
const path = require('path');

const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');

// @desc    Get variants for a product
// @route   GET /api/v1/products/:productId/variants
// @access  Public
const getVariantByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    // If product is not active, only staff/admin can see variants
    if (product.status !== 'ACTIVE' && (!req.user || !['STAFF', 'ADMIN'].includes(req.user.role))) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    const variants = await ProductVariant.find({ productId }).sort({ color: 1, size: 1 });
    res.status(200).json({ variants });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single variant by ID
// @route   GET /api/v1/products/variants/:id
// @access  Public
const getVariant = async (req, res, next) => {
  try {
    const variant = await ProductVariant.findById(req.params.id).populate(
      'productId',
      'name slug status'
    );
    if (!variant) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Variant not found' } });
    }

    // Check product status
    const product = variant.productId;
    if (product.status !== 'ACTIVE' && (!req.user || !['STAFF', 'ADMIN'].includes(req.user.role))) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Variant not found' } });
    }

    res.status(200).json({ variant });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new variant for a product
// @route   POST /api/v1/products/:productId/variants
// @access  Private/Staff, Admin
const createVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      if (req.files) {
        for (const file of req.files) {
          await fs.unlink(file.path).catch(() => {});
        }
      }
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    const {
      sku,
      color,
      size,
      price,
      compareAtPrice,
      stockQuantity,
      reservedQuantity,
      weight,
      barcode,
      status,
    } = req.body;

    // Check for existing variant with same productId + color + size
    const existing = await ProductVariant.findOne({ productId, color, size });
    if (existing) {
      if (req.files) {
        for (const file of req.files) {
          await fs.unlink(file.path).catch(() => {});
        }
      }
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_VARIANT',
          message: 'Variant with this color and size already exists',
        },
      });
    }

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/variants/${file.filename}`);
    }

    const variant = await ProductVariant.create({
      productId,
      sku,
      color,
      size,
      price,
      compareAtPrice: compareAtPrice || null,
      stockQuantity,
      reservedQuantity: reservedQuantity || 0,
      weight,
      barcode,
      images: images,
      status: status || 'ACTIVE',
    });

    if (product.status === 'DRAFT') {
      product.status = 'ACTIVE';
      await product.save();
    }

    res.status(201).json({
      message: 'Variant created successfully',
      variant,
    });
  } catch (error) {
    // Cleanup uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        await fs.unlink(file.path).catch(() => {});
      }
    }
    next(error);
  }
};

// @desc    Update a variant
// @route   PUT /api/v1/products/variants/:id
// @access  Private/Staff, Admin
const updateVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      sku,
      color,
      size,
      price,
      compareAtPrice,
      stockQuantity,
      reservedQuantity,
      weight,
      barcode,
      images,
      status,
    } = req.body;

    const variant = await ProductVariant.findById(id);
    if (!variant) {
      // Cleanup files if variant not found
      if (req.files) {
        for (const file of req.files) {
          await fs.unlink(file.path).catch(() => {});
        }
      }
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Variant not found' } });
    }

    // If changing color or size, check uniqueness
    if ((color && color !== variant.color) || (size && size !== variant.size)) {
      const conflict = await ProductVariant.findOne({
        productId: variant.productId,
        color: color || variant.colo,
        size: size || variant.size,
        _id: { $ne: id },
      });
      if (conflict) {
        // Cleanup files
        if (req.files) {
          for (const file of req.files) {
            await fs.unlink(file.path).catch(() => {});
          }
        }
        return res.status(409).json({
          error: {
            code: 'DUPLICATE_VARIANT',
            message: 'Another variant with this color and size already exists',
          },
        });
      }
    }

    // Update fields
    if (sku) variant.sku = sku;
    if (color) variant.color = color;
    if (size) variant.size = size;
    if (price !== undefined) variant.price = price;
    if (compareAtPrice !== undefined) variant.compareAtPrice = compareAtPrice;
    if (stockQuantity !== undefined) variant.stockQuantity = stockQuantity;
    if (reservedQuantity !== undefined) variant.reservedQuantity = reservedQuantity;
    if (weight !== undefined) variant.weight = weight;
    if (barcode) variant.barcode = barcode;
    if (status) variant.status = status;

    // Handle new images: if files uploaded, replace existing images
    if (req.files && req.files.length > 0) {
      // Delete old images from disk
      for (const imgUrl of variant.images) {
        const oldPath = path.join(__dirname, '..', '..', imgUrl);
        await fs.unlink(oldPath).catch(() => {});
      }
      // Set new image URLs
      variant.images = req.files.map((file) => `/uploads/variants/${file.filename}`);
    }

    await variant.save();

    res.status(200).json({
      message: 'Variant updated successfully',
      variant,
    });
  } catch (error) {
    // Cleanup newly uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        await fs.unlink(file.path).catch(() => {});
      }
    }
    next(error);
  }
};

// @desc    Delete a variant (soft delete by setting status to DISCONTINUED)
// @route   DELETE /api/v1/products/variants/:id
// @access  Private/Staff, Admin
const deleteVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const variant = await ProductVariant.findById(id);
    if (!variant) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Variant not found' } });
    }

    variant.status = 'DISCONTINUED';
    await variant.save();

    res.status(200).json({ message: 'Variant discontinued successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVariantByProduct, getVariant, createVariant, updateVariant, deleteVariant };
