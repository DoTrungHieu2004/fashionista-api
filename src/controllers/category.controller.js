const fs = require('fs');
const path = require('path');

const Category = require('../models/Category');

// @desc    Get all active categories (public)
// @route   GET /api/v1/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    const categories = await Category.find(filter)
      .populate('parentCategoryId', 'name slug')
      .sort({ name: 1 });
    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by ID (public)
// @route   GET /api/v1/categories/:id
// @access  Public
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      'parentCategoryId',
      'name slug'
    );
    if (!category) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
    }
    res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new category (admin only)
// @route   POST /api/v1/categories
// @access  Private/Admin
const createCategory = async (req, res, next) => {
  try {
    // imageUrl is set by multer
    const { name, parentCategoryId, isActive } = req.body;
    const imageFile = req.file;
    if (!imageFile) {
      return res.status(400).json({ code: 'MISSING_IMAGE', message: 'Category image is required' });
    }

    // Build image URL (relative path to be served)
    const imageUrl = `/uploads/categories/${imageFile.filename}`;

    // Check if parent category exists
    if (parentCategoryId) {
      const parent = await Category.findById(parentCategoryId);
      if (!parent) {
        // remove uploaded file if parent invalid
        await fs.unlink(imageFile.path);
        return res
          .status(400)
          .json({ error: { code: 'INVALID_PARENT', message: 'Parent category not found' } });
      }
    }

    const category = await Category.create({
      name,
      parentCategoryId: parentCategoryId || null,
      imageUrl,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    // If error, remove uploaded file
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// @desc    Update a category (admin only)
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, parentCategoryId, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
    }

    // Check parent existence if changing
    if (parentCategoryId !== undefined) {
      if (parentCategoryId && parentCategoryId !== category.parentCategoryId?.toString()) {
        const parent = await Category.findById(parentCategoryId);
        if (!parent) {
          return res
            .status(400)
            .json({ error: { code: 'INVALID_PARENT', message: 'Parent category not found' } });
        }
        // Prevent self-parent
        if (parentCategoryId === id) {
          return res
            .status(400)
            .json({ error: { code: 'SELF_PARENT', message: 'Cannot set self as parent' } });
        }
      }
    }

    // Update fields
    if (name) category.name = name;
    if (parentCategoryId !== undefined) category.parentCategoryId = parentCategoryId || null;
    if (isActive !== undefined) category.isActive = isActive;

    // If new image uploaded, replace old one
    if (req.file) {
      // Delete old image file (if exists and not default)
      if (category.imageUrl) {
        const oldPath = path.join(__dirname, '..', '..', category.imageUrl);
        await fs.unlink(oldPath).catch(() => {}); // Ignore if not found
      }
      category.imageUrl = `/uploads/categories/${req.file.filename}`;
    }

    await category.save();

    res.status(200).json({
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    // If new file uploaded and error, remove it
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

// @desc    Delete a category (soft delete by setting isActive false) (admin only)
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    res.status(200).json({ message: 'Category deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
