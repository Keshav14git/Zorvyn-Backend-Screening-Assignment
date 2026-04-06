const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const requestLogger = require('./utils/logger');
const errorHandler = require('./middleware/error.middleware');
const ApiError = require('./utils/ApiError');
const env = require('./config/env');

// Route modules
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const recordRoutes = require('./routes/record.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Security
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    data: null,
  },
});
app.use(limiter);

// Body Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request Logging
app.use(requestLogger());

// Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Finance Dashboard API is running.',
    data: {
      environment: env.nodeEnv,
      uptime: `${Math.floor(process.uptime())}s`,
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Handler
app.use((_req, _res, next) => {
  next(ApiError.notFound('The requested endpoint does not exist.'));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
