const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');

// @desc    Get site settings
// @route   GET /api/admin/settings
// @access  Private
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.json(settings);
});

// @desc    Update site settings
// @route   PUT /api/admin/settings
// @access  Private
const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  const fields = [
    'companyName', 'tagline', 'foundedYear',
    'email', 'phone', 'whatsapp', 'address',
    'social', 'seo',
  ];

  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      settings[field] = req.body[field];
    }
  });

  const updated = await settings.save();
  res.json(updated);
});

module.exports = { getSettings, updateSettings };
