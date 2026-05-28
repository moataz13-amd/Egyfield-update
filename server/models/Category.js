const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      ar: { type: String, required: [true, 'Arabic name is required'] },
      en: { type: String, required: [true, 'English name is required'] },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    icon: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#7BB445',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Category', categorySchema);
