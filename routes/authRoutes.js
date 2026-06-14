const express          = require('express');
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
}                      = require('../controllers/authController');
const { protectRoute } = require('../middleware/authMiddleware');

const router = express.Router();

// =====================
// Page Routes (GET)
// Must be defined BEFORE
// any middleware that
// could intercept them
// =====================

// @route   GET /
// @desc    Home page
// @access  Public
router.get('/', (req, res) => {
  res.render('pages/home', {
    title: 'Netflix Clone — Home',
    user:  req.user || null,
  });
});

// @route   GET /register
// @desc    Show register page
// @access  Public
router.get('/register', (req, res) => {
  res.render('pages/register', {
    title: 'Register — Netflix Clone',
    user:  null,
  });
});

// @route   GET /login
// @desc    Show login page
// @access  Public
router.get('/login', (req, res) => {
  res.render('pages/login', {
    title: 'Login — Netflix Clone',
    user:  null,
  });
});

// @route   GET /forgot-password
// @desc    Show forgot password page
// @access  Public
router.get('/forgot-password', (req, res) => {
  res.render('pages/forgot-password', {
    title: 'Forgot Password — Netflix Clone',
    user:  null,
  });
});

// @route   GET /reset-password/:token
// @desc    Show reset password page
// @access  Public
router.get('/reset-password/:token', (req, res) => {
  res.render('pages/reset-password', {
    title: 'Reset Password — Netflix Clone',
    token: req.params.token,
    user:  null,
  });
});

// =====================
// API Routes (POST)
// =====================

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/api/auth/register', registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/api/auth/login', loginUser);

// @route   GET /logout
// @desc    Logout user
// @access  Private
router.get('/logout', protectRoute, logoutUser);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/api/auth/forgot-password', forgotPassword);

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/api/auth/reset-password/:token', resetPassword);

module.exports = router;