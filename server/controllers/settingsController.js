const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');
const cloudinary = require('../config/cloudinary');

// @desc    Get site settings
// @route   GET /api/admin/settings
// @access  Private
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  } else {
    let modified = false;
    if (settings.heroTitle === undefined || settings.heroTitle === null) {
      settings.heroTitle = {
        en: "Egypt's Finest Agricultural Exports",
        ar: 'أجود الحاصلات الزراعية المصرية',
        fr: "Les Meilleures Exportations Agricoles d'Égypte",
        it: "Le Migliori Esportazioni Agricole dell'Egitto",
        tr: "Mısır'ın En Kaliteli Tarım İhracatı",
      };
      modified = true;
    }
    if (settings.heroSubtitle === undefined || settings.heroSubtitle === null) {
      settings.heroSubtitle = {
        en: 'Premium quality pickles, fresh produce, frozen goods & grains — delivered worldwide',
        ar: 'مخللات ومنتجات طازجة ومجمدة وحبوب بأعلى معايير الجودة — شحن عالمي',
        fr: 'Cornichons de qualité supérieure, produits frais, surgelés et céréales — livrés dans le monde entier',
        it: "Sottaceti di qualità superiore, prodotti frescos, surgelati e cereali — spediti in tutto il mondo",
        tr: 'Birinci sınıf turşu, taze sebze-meyve, dondurulmuş gıdalar & bakliyat — dünya çapında teslimat',
      };
      modified = true;
    }
    if (!settings.heroImage) {
      settings.heroImage = { url: '', publicId: '' };
      modified = true;
    }
    if (!settings.heroImages || settings.heroImages.length === 0) {
      if (settings.heroImage && settings.heroImage.url) {
        settings.heroImages = [
          {
            url: settings.heroImage.url,
            publicId: settings.heroImage.publicId,
          }
        ];
        modified = true;
      }
    }
    if (settings.heroTitleColor === undefined || settings.heroTitleColor === null) {
      settings.heroTitleColor = '#ffffff';
      modified = true;
    }
    if (settings.heroSubtitleColor === undefined || settings.heroSubtitleColor === null) {
      settings.heroSubtitleColor = '#ffffff';
      modified = true;
    }
    if (modified) {
      await settings.save();
    }
  }
  res.json(settings);
});

// @desc    Update site settings
// @route   PUT /api/admin/settings
// @access  Private
const updateSettings = asyncHandler(async (req, res) => {
  console.log('Updating settings with payload:', JSON.stringify(req.body, null, 2));

  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  const fields = [
    'companyName', 'tagline', 'foundedYear',
    'email', 'phone', 'whatsapp', 'address',
    'social', 'seo', 'heroTitle', 'heroSubtitle',
    'heroTitleColor', 'heroSubtitleColor', 'heroImages',
  ];

  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      settings[field] = req.body[field];
      if (typeof req.body[field] === 'object' && req.body[field] !== null) {
        settings.markModified(field);
      }
    }
  });

  const updated = await settings.save();
  console.log('Settings updated successfully in database.');
  res.json(updated);
});

// @desc    Update hero image
// @route   PUT /api/admin/settings/hero-image
// @access  Private (Admin)
const updateHeroImage = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image');
  }

  // Delete old image from Cloudinary if it exists
  if (settings.heroImage && settings.heroImage.publicId) {
    try {
      await cloudinary.uploader.destroy(settings.heroImage.publicId);
    } catch (err) {
      console.error('Error deleting old hero image:', err);
    }
  }

  settings.heroImage = {
    url: req.file.path,
    publicId: req.file.filename,
  };

  const updated = await settings.save();
  res.json(updated);
});

// @desc    Delete hero image
// @route   DELETE /api/admin/settings/hero-image
// @access  Private (Admin)
const deleteHeroImage = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  if (settings.heroImage && settings.heroImage.publicId) {
    try {
      await cloudinary.uploader.destroy(settings.heroImage.publicId);
    } catch (err) {
      console.error('Error deleting hero image from Cloudinary:', err);
    }
  }

  settings.heroImage = {
    url: '',
    publicId: '',
  };

  const updated = await settings.save();
  res.json(updated);
});

// @desc    Add hero image to slider
// @route   POST /api/admin/settings/hero-images
// @access  Private (Admin)
const addHeroImage = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image');
  }

  if (!settings.heroImages) {
    settings.heroImages = [];
  }

  settings.heroImages.push({
    url: req.file.path,
    publicId: req.file.filename,
  });

  const updated = await settings.save();
  res.json(updated);
});

// @desc    Delete hero image from slider
// @route   DELETE /api/admin/settings/hero-images
// @access  Private (Admin)
const deleteSliderImage = asyncHandler(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) {
    res.status(400);
    throw new Error('Please provide publicId');
  }

  let settings = await Settings.findOne();
  if (!settings) {
    res.status(404);
    throw new Error('Settings not found');
  }

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Error deleting slider image from Cloudinary:', err);
  }

  // Pull from heroImages array
  settings.heroImages = settings.heroImages.filter(img => img.publicId !== publicId);
  const updated = await settings.save();
  res.json(updated);
});

module.exports = { 
  getSettings, 
  updateSettings, 
  updateHeroImage, 
  deleteHeroImage,
  addHeroImage,
  deleteSliderImage
};
