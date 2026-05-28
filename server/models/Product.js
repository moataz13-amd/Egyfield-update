const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      ar: { type: String, required: [true, 'Arabic name is required'] },
      en: { type: String, required: [true, 'English name is required'] },
    },
    description: {
      ar: { type: String, required: [true, 'Arabic description is required'] },
      en: { type: String, required: [true, 'English description is required'] },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    origin: {
      type: String,
      default: 'Egypt',
    },
    packaging: {
      type: String,
      default: '',
    },
    season: {
      type: String,
      default: 'Year-round',
    },
    certifications: [String],
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
productSchema.index({ 'name.en': 'text', 'name.ar': 'text', 'description.en': 'text', 'description.ar': 'text' });

module.exports = mongoose.model('Product', productSchema);
