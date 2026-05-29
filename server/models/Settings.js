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
    heroImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    heroImages: [
      {
        url: { type: String },
        publicId: { type: String },
      }
    ],
    heroTitleColor: { type: String, default: '#ffffff' },
    heroSubtitleColor: { type: String, default: '#ffffff' },
    heroTitle: {
      en: { type: String, default: "Egypt's Finest Agricultural Exports" },
      ar: { type: String, default: 'أجود الحاصلات الزراعية المصرية' },
      fr: { type: String, default: "Les Meilleures Exportations Agricoles d'Égypte" },
      it: { type: String, default: "Le Migliori Esportazioni Agricole dell'Egitto" },
      tr: { type: String, default: "Mısır'ın En Kaliteli Tarım İhracatı" },
    },
    heroSubtitle: {
      en: { type: String, default: 'Premium quality pickles, fresh produce, frozen goods & grains — delivered worldwide' },
      ar: { type: String, default: 'مخللات ومنتجات طازجة ومجمدة وحبوب بأعلى معايير الجودة — شحن عالمي' },
      fr: { type: String, default: 'Cornichons de qualité supérieure, produits frais, surgelés et céréales — livrés dans le monde entier' },
      it: { type: String, default: 'Sottaceti di qualità superiore, prodotti freschi, surgelati e cereali — spediti in tutto il mondo' },
      tr: { type: String, default: 'Birinci sınıf turşu, taze sebze-meyve, dondurulmuş gıdalar ve bakliyat — dünya çapında teslimat' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
