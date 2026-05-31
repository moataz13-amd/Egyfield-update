const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema(
  {
    name: {
      ar: { type: String, required: [true, 'Arabic name is required'] },
      en: { type: String, required: [true, 'English name is required'] },
    },
    logo: {
      url: { type: String, required: [true, 'Logo URL is required'] },
      publicId: { type: String, required: [true, 'Logo public ID is required'] },
    },
    website: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Partner', partnerSchema);
