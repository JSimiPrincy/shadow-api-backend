const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import Routes
const authRoutes = require('./api/routes/auth.routes');
const targetRoutes = require('./api/routes/targets.routes');
const scannerRoutes = require('./api/routes/scanner.routes');
const shadowApiRoutes = require('./api/routes/shadowApi.routes');
const exposureRoutes = require('./api/routes/exposure.routes');

const app = express();

// Global Middleware
app.use(helmet()); // Security headers
app.use(cors());   // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev'));  // Logging

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/targets', targetRoutes);
app.use('/api/scanner', scannerRoutes);
app.use('/api/shadow-apis', shadowApiRoutes);
app.use('/api/exposures', exposureRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

module.exports = app;