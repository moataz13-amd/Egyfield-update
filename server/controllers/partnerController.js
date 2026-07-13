const asyncHandler = require('express-async-handler');
const Partner = require('../models/Partner');
const cloudinary = require('../config/cloudinary');

// @desc    Get all partners
// @route   GET /api/partners
// @access  Public (Optional admin parameter to get inactive ones)
const getPartners = asyncHandler(async (req, res) => {
  const { admin = 'false' } = req.query;

  const query = {};
  if (admin !== 'true') {
    query.isActive = true;
  }

  const partners = await Partner.find(query).sort({ order: 1, createdAt: -1 });
  res.json(partners);
});

// @desc    Get single partner by ID
// @route   GET /api/partners/:id
// @access  Private (Admin)
const getPartnerById = asyncHandler(async (req, res) => {
  const partner = await Partner.findById(req.params.id);

  if (!partner) {
    res.status(404);
    throw new Error('Partner not found');
  }

  res.json(partner);
});

// @desc    Create partner
// @route   POST /api/partners
// @access  Private (Admin)
const createPartner = asyncHandler(async (req, res) => {
  const { name, website, isActive, order } = req.body;

  let parsedName;
  try {
    parsedName = typeof name === 'string' ? JSON.parse(name) : name;
  } catch (err) {
    res.status(400);
    throw new Error('Invalid JSON format for name field');
  }

  const logo = req.body.logoData
    ? (typeof req.body.logoData === 'string' ? JSON.parse(req.body.logoData) : req.body.logoData)
    : req.file
      ? { url: req.file.path, publicId: req.file.filename }
      : null;

  if (!logo) {
    res.status(400);
    throw new Error('Logo image is required');
  }

  const partner = await Partner.create({
    name: parsedName,
    logo,
    website: website || '',
    isActive: isActive === 'true' || isActive === true,
    order: Number(order) || 0,
  });

  res.status(201).json(partner);
});

// @desc    Update partner
// @route   PUT /api/partners/:id
// @access  Private (Admin)
const updatePartner = asyncHandler(async (req, res) => {
  const partner = await Partner.findById(req.params.id);

  if (!partner) {
    res.status(404);
    throw new Error('Partner not found');
  }

  const { name, website, isActive, order } = req.body;

  if (name) {
    try {
      partner.name = typeof name === 'string' ? JSON.parse(name) : name;
    } catch (err) {
      res.status(400);
      throw new Error('Invalid JSON format for name field');
    }
  }

  if (website !== undefined) partner.website = website;
  if (isActive !== undefined) partner.isActive = isActive === 'true' || isActive === true;
  if (order !== undefined) partner.order = Number(order) || 0;

  const newLogo = req.body.logoData
    ? (typeof req.body.logoData === 'string' ? JSON.parse(req.body.logoData) : req.body.logoData)
    : req.file
      ? { url: req.file.path, publicId: req.file.filename }
      : null;

  if (newLogo) {
    // Delete old logo from Cloudinary
    if (partner.logo && partner.logo.publicId) {
      await cloudinary.uploader.destroy(partner.logo.publicId).catch((err) => {
        console.error('Failed to delete old logo from Cloudinary:', err);
      });
    }

    partner.logo = newLogo;
  }

  const updatedPartner = await partner.save();
  res.json(updatedPartner);
});

// @desc    Delete partner
// @route   DELETE /api/partners/:id
// @access  Private (Admin)
const deletePartner = asyncHandler(async (req, res) => {
  const partner = await Partner.findById(req.params.id);

  if (!partner) {
    res.status(404);
    throw new Error('Partner not found');
  }

  // Delete logo from Cloudinary
  if (partner.logo && partner.logo.publicId) {
    await cloudinary.uploader.destroy(partner.logo.publicId).catch((err) => {
      console.error('Failed to delete logo from Cloudinary:', err);
    });
  }

  await partner.deleteOne();
  res.json({ message: 'Partner removed' });
});

module.exports = {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
};
