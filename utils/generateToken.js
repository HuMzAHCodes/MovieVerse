const jwt    = require('jsonwebtoken');
const logger = require('./logger');

// =====================
// Token Configuration
// =====================
const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRE  = process.env.JWT_EXPIRE || '7d';

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,   // Prevents client-side JS from accessing the cookie
  secure:   process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict', // Prevents CSRF attacks
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// =====================
// Generate JWT Token
// =====================
const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
    return token;
  } catch (error) {
    logger.error(`Token generation failed: ${error.message}`);
    throw new Error('Token generation failed');
  }
};

// =====================
// Verify JWT Token
// =====================
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    throw new Error('Invalid or expired token');
  }
};

// =====================
// Send Token via Cookie
// =====================
const sendTokenCookie = (res, token) => {
  res.cookie('authToken', token, COOKIE_OPTIONS);
};

// =====================
// Clear Token Cookie
// =====================
const clearTokenCookie = (res) => {
  res.cookie('authToken', '', {
    httpOnly: true,
    expires:  new Date(0), // Expire immediately
  });
};

module.exports = {
  generateToken,
  verifyToken,
  sendTokenCookie,
  clearTokenCookie,
};