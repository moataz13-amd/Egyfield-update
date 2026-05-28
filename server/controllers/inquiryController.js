const asyncHandler = require('express-async-handler');
const Inquiry = require('../models/Inquiry');

// @desc    Submit inquiry (public)
// @route   POST /api/inquiries
// @access  Public
const createInquiry = asyncHandler(async (req, res) => {
  const { name, email, company, country, productInterest, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email, and message are required');
  }

  const inquiry = await Inquiry.create({
    name,
    email,
    company: company || '',
    country: country || '',
    productInterest: productInterest || '',
    message,
  });

  res.status(201).json({ message: 'Inquiry submitted successfully', inquiry });
});

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private (Admin)
const getInquiries = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [inquiries, total] = await Promise.all([
    Inquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Inquiry.countDocuments(query),
  ]);

  // Get counts by status
  const [newCount, readCount, repliedCount] = await Promise.all([
    Inquiry.countDocuments({ status: 'new' }),
    Inquiry.countDocuments({ status: 'read' }),
    Inquiry.countDocuments({ status: 'replied' }),
  ]);

  res.json({
    inquiries,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
    counts: { new: newCount, read: readCount, replied: repliedCount },
  });
});

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id/status
// @access  Private (Admin)
const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['new', 'read', 'replied'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Must be: new, read, or replied');
  }

  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  res.json(inquiry);
});

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private (Admin)
const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);

  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  await Inquiry.findByIdAndDelete(req.params.id);
  res.json({ message: 'Inquiry deleted successfully' });
});

module.exports = {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
};
