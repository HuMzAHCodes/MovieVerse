const express    = require('express');
const mongoose   = require('mongoose');
const morgan     = require('morgan');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const path       = require('path');
const dotenv     = require('dotenv');

// Load environment variables first
dotenv.config();

const connectDatabase = require('./config/db');
const logger          = require('./utils/logger');

// =====================
// Initialize App
// =====================
const app  = express();
const PORT = process.env.PORT || 3000;

// =====================
// Connect to Database
// =====================
connectDatabase();

// =====================
// Middleware
// =====================

// HTTP request logger (Morgan) — logs every request to console
app.use(morgan('dev'));

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded form data (from HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse cookies from incoming requests
app.use(cookieParser());

// Allow PUT and DELETE from HTML forms using ?_method=PUT
app.use(methodOverride('_method'));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// =====================
// View Engine — EJS
// =====================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =====================
// Routes
// =====================

// Home route
app.get('/', (req, res) => {
  res.render('pages/home', {
    title: 'Netflix Clone — Home',
  });
});

// =====================
// 404 Handler
// =====================
app.use((req, res) => {
  res.status(404).render('pages/home', {
    title: 'Page Not Found',
  });
});

// =====================
// Global Error Handler
// =====================
app.use((err, req, res, next) => {
  logger.error(`${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// =====================
// Start Server
// =====================
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;