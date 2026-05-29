const mongoose = require('mongoose');

const localizedStringSchema = {
  en: { type: String, default: '' },
  ar: { type: String, default: '' },
  fr: { type: String, default: '' },
  it: { type: String, default: '' },
  tr: { type: String, default: '' },
};

const articleSchema = new mongoose.Schema(
  {
    title: localizedStringSchema,
    content: localizedStringSchema,
    summary: localizedStringSchema,
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    views: {
      type: Number,
      default: 0,
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
articleSchema.index({ 
  'title.en': 'text', 
  'title.ar': 'text', 
  'content.en': 'text', 
  'content.ar': 'text' 
});

module.exports = mongoose.model('Article', articleSchema);
