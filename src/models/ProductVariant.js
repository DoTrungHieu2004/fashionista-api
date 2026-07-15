const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: [true, 'Product ID is required'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true,
    },
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      required: [true, 'Size is required'],
    },
    price: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    compareAtPrice: { type: mongoose.Schema.Types.Decimal128, default: null },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative'],
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [0, 'Weight cannot be negative'],
    },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index on productId + color + size
productVariantSchema.index({ productId: 1, color: 1, size: 1 }, { unique: true });
productVariantSchema.index({ sku: 1 }, { unique: true });
productVariantSchema.index({ productId: 1 });

module.exports = mongoose.model('product_variant', productVariantSchema);
