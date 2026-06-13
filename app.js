const express        = require('express');
const morgan         = require('morgan');
const cookieParser   = require('cookie-parser');
const methodOverride = require('method-override');
const path           = require('path');
const dotenv         = require('dotenv');

// Load environment variables first
dotenv.config();

const connectDatabase                        = require('./config/db');
const logger                                 = require('./utils/logger');
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

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

// HTTP request logger (Morgan)
app.use(morgan('dev'));

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded form data (from HTML forms)
app.use(express.urlencoded({ extended: true }));

// Parse cookies from incoming requests
app.use(cookieParser());

// Allow PUT and DELETE from HTML forms
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
const authRoutes = require('./routes/authRoutes');

app.use('/', authRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('pages/home', {
    title: 'Netflix Clone — Home',
    user:  null,
  });
});

// =====================
// 404 Handler
// =====================
app.use(notFoundHandler);

// =====================
// Global Error Handler
// =====================
app.use(globalErrorHandler);

// =====================
// Start Server
// =====================
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;