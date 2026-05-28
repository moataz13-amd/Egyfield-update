const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        res.status(401);
        throw new Error('Not authorized - admin not found');
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized - invalid token');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized - no token provided');
  }
});

module.exports = { protect };
