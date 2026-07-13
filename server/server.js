const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 10000,
  message: { message: 'Too many requests, please try again later.' },
  skip: () => !!process.env.VERCEL,
});
app.use('/api/', limiter);

// CORS - allow multiple origins for dev + Vercel
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5170',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.some(a => origin.startsWith(a))) {
      return callback(null, true);
    }
    if (process.env.VERCEL_URL && origin.includes(process.env.VERCEL_URL)) {
      return callback(null, true);
    }
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check (defined BEFORE DB middleware so it works without DB)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    dbConnected: !!app.locals.dbConnected,
    timestamp: new Date().toISOString(),
  });
});

// Lazy DB connection middleware (skips /health)
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (app.locals.dbConnected) return next();
  connectDB()
    .then(() => {
      app.locals.dbConnected = true;
      next();
    })
    .catch((err) => {
      res.status(503).json({ message: 'Database connection failed', error: err.message });
    });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/admin/analytics', require('./routes/analyticsRoutes'));
app.use('/api/admin/settings', require('./routes/settingsRoutes'));
app.use('/api/admin/accounts', require('./routes/adminRoutes'));
app.use('/api/about', require('./routes/aboutRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/admin/cloudinary', require('./routes/cloudinaryRoutes'));
app.get('/api/settings', require('./controllers/settingsController').getSettings);

// Error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// API 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const distPath = path.join(process.cwd(), 'client/dist');
  app.use(express.static(distPath));
  app.get('/*splat', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// Global 404 handler
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ message: 'Route not found' });
  } else {
    res.status(404).json({ message: 'Not found' });
  }
});

// Local development server
if (require.main === module) {
  connectDB().then(() => {
    app.locals.dbConnected = true;
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  });
}

module.exports = app;
