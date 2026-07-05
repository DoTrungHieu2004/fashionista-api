const mongoose = require('mongoose');
const slugify = require('slugify');

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
      unique: true,
    },
    slug: { type: String, required: true, unique: true },
    logoUrl: { type: String, required: [true, 'Brand logo is required'] },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Generate slug before saving
brandSchema.pre('validate', function () {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

// Indexes
brandSchema.index({ slug: 1 }, { unique: true });
brandSchema.index({ isActive: 1 });

module.exports = mongoose.model('brand', brandSchema);
