const fs = require('fs').promises;
const path = require('path');

const Brand = require('../models/Brand');

// @desc    Get all active brands (public)
// @route   GET /api/v1/brands
// @access  Public
const getBrands = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    const brands = await Brand.find(filter).sort({ name: 1 });
    res.status(200).json({ brands });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single brand by ID (public)
// @route   GET /api/v1/brands/:id
// @access  Public
const getBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Brand not found' } });
    }
    res.status(200).json({ brand });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new brand (admin only)
// @route   POST /api/v1/brands
// @access  Private/Admin
const createBrand = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    const logoFile = req.file;
    if (!logoFile) {
      return res
        .status(400)
        .json({ error: { code: 'MISSING_LOGO', message: 'Brand logo is required' } });
    }

    const logoUrl = `/uploads/brands/${logoFile.filename}`;

    const brand = await Brand.create({
      name,
      description: description || '',
      logoUrl,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      message: 'Brand created successfully',
      brand,
    });
  } catch (error) {
    // If error, remove uploaded file
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// @desc    Update a brand (admin only)
// @route   PUT /api/v1/brands/:id
// @access  Private/Admin
const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Brand not found' } });
    }

    // Update fields
    if (name) brand.name = name;
    if (description !== undefined) brand.description = description;
    if (isActive !== undefined) brand.isActive = isActive;

    // If new logo uploaded, replace old one
    if (req.file) {
      // Delete old logo file (if exists)
      if (brand.logoUrl) {
        const oldPath = path.join(__dirname, '..', '..', brand.logoUrl);
        await fs.unlink(oldPath).catch(() => {}); // ignore if not found
      }
      brand.logoUrl = `/uploads/brands/${req.file.filename}`;
    }

    await brand.save();

    res.status(200).json({
      message: 'Brand updated successfully',
      brand,
    });
  } catch (error) {
    // If new file uploaded and error, remove it
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// @desc    Delete a brand (soft delete) (admin only)
// @route   DELETE /api/v1/brands/:id
// @access  Private/Admin
const deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Brand not found' } });
    }

    brand.isActive = false;
    await brand.save();

    res.status(200).json({ message: 'Brand deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBrands, getBrand, createBrand, updateBrand, deleteBrand };
