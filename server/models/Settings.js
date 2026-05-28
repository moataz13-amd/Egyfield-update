const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    companyName: {
      en: { type: String, default: 'EgyField' },
      ar: { type: String, default: 'إيجي فيلد' },
    },
    tagline: {
      en: { type: String, default: 'Premium Egyptian Agricultural Exports' },
      ar: { type: String, default: 'صادرات زراعية مصرية فاخرة' },
    },
    foundedYear: { type: Number, default: 2015 },
    email: { type: String, default: 'info@egyfield.com' },
    phone: { type: String, default: '+20 123 456 7890' },
    whatsapp: { type: String, default: '+20 123 456 7890' },
    address: {
      en: { type: String, default: 'Cairo, Egypt' },
      ar: { type: String, default: 'القاهرة، مصر' },
    },
    social: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    seo: {
      metaTitle: { type: String, default: 'EgyField — Premium Egyptian Agricultural Exports' },
      metaDescription: { type: String, default: 'EgyField specializes in premium Egyptian agricultural exports worldwide.' },
      keywords: [{ type: String }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
