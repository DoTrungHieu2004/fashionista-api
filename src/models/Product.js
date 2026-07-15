const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    slug: { type: String, required: true, unique: true },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'brand',
      required: [true, 'Brand is required'],
    },
    categoryIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'category',
      required: [true, 'At least one category is required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one category is required',
      },
    },
    gender: {
      type: String,
      enum: ['MEN', 'WOMEN', 'UNISEX', 'KIDS'],
      required: [true, 'Gender is required'],
    },
    material: { type: String, required: [true, 'Material is required'], trim: true },
    tags: { type: [String], default: [] },
    status: {
      type: String,
      required: true,
      enum: ['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'],
      default: 'DRAFT',
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          alt: { type: String, default: '' },
          position: { type: Number, default: 0 },
        },
      ],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Product must have at least one image',
      },
      default: [],
    },
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
productSchema.pre('validate', function () {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true, trim: true });
  }
});

// Indexes
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ categoryIds: 1 });
productSchema.index({ brandId: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ status: 1 });
productSchema.index(
  { name: 'text', description: 'text', tags: 'text' },
  { weights: { name: 10, tags: 5, description: 1 } }
);

module.exports = mongoose.model('product', productSchema);
