const express        = require('express');
const morgan         = require('morgan');
const cookieParser   = require('cookie-parser');
const methodOverride = require('method-override');
const path           = require('path');
const dotenv         = require('dotenv');

// Force Google DNS to bypass ISP DNS blocking
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load environment variables first
dotenv.config();

const connectDatabase                         = require('./config/db');
const logger                                  = require('./utils/logger');
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

// =====================
// Initialize App
// =====================
const app  = express();
const PORT = process.env.PORT || 3000;

// =====================
// Database Middleware
// (Ensures DB is connected
//  before every request)
// =====================
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (err) {
    next(err);
  }
});

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

// =====================
// View Engine — EJS
// =====================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =====================
// Static Files
// =====================
app.use('/css',    express.static(path.join(__dirname, 'public', 'css')));
app.use('/js',     express.static(path.join(__dirname, 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));






// =====================
// Swagger API Docs
// =====================
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');






// =====================
// Routes
// =====================
const authRoutes  = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const userRoutes  = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');




// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Netflix Clone API Docs',
  customCss: `
    .swagger-ui .topbar { background-color: #141414; }
    .swagger-ui .topbar-wrapper img { display: none; }
    .swagger-ui .topbar-wrapper::before {
      content: 'NETFLIX CLONE API';
      color: #e50914;
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 2px;
    }
  `,
}));







app.use('/', authRoutes);
app.use('/', movieRoutes);
app.use('/', userRoutes);
app.use('/', adminRoutes);

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
// (Local only — Vercel
//  handles this itself)
// =====================
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = app;