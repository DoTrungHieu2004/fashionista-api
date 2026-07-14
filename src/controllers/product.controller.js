const fs = require('fs').promises;
const path = require('path');

const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');

// Helper to validate brand and categories existence
const validateReferences = async (brandId, categoryIds) => {
  const brand = await Brand.findById(brandId);
  if (!brand) throw new Error('Brand not found');

  if (categoryIds && categoryIds.length > 0) {
    const categories = await Category.find({ _id: { $in: categoryIds } });
    if (categories.length !== categoryIds.length) {
      throw new Error('One or more categories not found');
    }
  }
};

// @desc    Get all products (with filtering, pagination, search)
// @route   GET /api/v1/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      category,
      brand,
      gender,
      status,
      search,
      minPrice,
      maxPrice,
    } = req.query;

    const filter = {};

    // Public only sees ACTIVE products unless staff/admin (handled by role)
    if (!req.user || (req.user && !['STAFF', 'ADMIN'].includes(req.user.role))) {
      filter.status = 'ACTIVE';
    } else if (status) {
      filter.status = status;
    }

    // Filters
    if (category) filter.categoryIds = category;
    if (brand) filter.brandId = brand;
    if (gender) filter.gender = gender;

    // Text search
    let searchFilter = {};
    if (search) {
      searchFilter = { $text: { $search: search } };
    }

    const query = { ...filter, ...searchFilter };

    // Pagination
    const skip = (page - 1) * limit;
    const sortOption = sort.startsWith('-') ? { [sort.slice(1)]: -1 } : { [sort]: 1 };

    const products = await Product.find(query)
      .populate('brandId', 'name slug')
      .populate('categoryIds', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/v1/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ $or: [{ _id: id }, { slug: id }] })
      .populate('brandId', 'name slug logoUrl')
      .populate('categoryIds', 'name slug');

    if (!product) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    // If product is not active and user is not staff/admin, deny
    if (product.status !== 'ACTIVE' && (!req.user || !['STAFF', 'ADMIN'].includes(req.user.role))) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product (staff/admin)
// @route   POST /api/v1/products
// @access  Private/Staff, Admin
const createProduct = async (req, res, next) => {
  try {
    const { name, description, brandId, categoryIds, gender, material, tags, status } = req.body;

    // Validate references
    await validateReferences(brandId, categoryIds);

    // Handle images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        images.push({
          url: `/uploads/products/${file.filename}`,
          alt: name || `Product image ${index + 1}`,
          position: index,
        });
      });
    }

    const product = await Product.create({
      name,
      description,
      brandId,
      categoryIds,
      gender,
      material,
      tags: tags || [],
      status: status || 'DRAFT',
      images,
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
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

// @desc    Update a product (staff/admin)
// @route   PUT /api/v1/products/:id
// @access  Private/Staff, Admin
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, brandId, categoryIds, gender, material, tags, status } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    // Validate references if changing
    if (brandId) await validateReferences(brandId, categoryIds || product.categoryIds);
    if (categoryIds) await validateReferences(product.brandId, categoryIds);

    // Update fields
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (brandId) product.brandId = brandId;
    if (categoryIds) product.categoryIds = categoryIds;
    if (gender) product.gender = gender;
    if (material) product.material = material;
    if (tags !== undefined) product.tags = tags;
    if (status) product.status = status;

    // Handle new images: if files uploaded, replace existing images
    if (req.files && req.files.length > 0) {
      // Delete old images from disk
      for (const img of product.images) {
        const oldPath = path.join(__dirname, '..', '..', img.url);
        await fs.unlink(oldPath).catch(() => {});
      }
      // Set new images
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        alt: name || product.name || `Product image ${index + 1}`,
        position: index,
      }));
      product.images = newImages;
    }

    await product.save();

    res.status(200).json({
      message: 'Product updated successfully',
      product,
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

// @desc    Delete (soft archive) a product (staff/admin)
// @route   DELETE /api/v1/products/:id
// @access  Private/Staff, Admi
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    // Soft delete: set status to ARCHIVED
    product.status = 'ARCHIVED';
    await product.save();

    res.status(200).json({ message: 'Product archived successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
