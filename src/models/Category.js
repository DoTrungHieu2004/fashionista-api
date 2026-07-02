const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    parentCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'category',
      default: null,
    },
    imageUrl: {
      type: String,
      required: [true, 'Category image is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Generate slug before saving
categorySchema.pre('validate', function () {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// Prevent circular reference in parent category
categorySchema.pre('save', function () {
  if (this.parentCategoryId && this.parentCategoryId.equals(this._id)) {
    new Error('A category cannot be its own parent');
  }
});

// Indexes
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parentCategoryId: 1 });
categorySchema.index({ isActive: 1 });

module.exports = mongoose.model('category', categorySchema);
