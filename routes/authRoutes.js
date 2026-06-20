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
// =====================

/**
 * @swagger
 * /:
 *   get:
 *     summary: Home landing page
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Renders the home landing page
 */
router.get('/', (req, res) => {
  res.render('pages/home', {
    title: 'Netflix Clone — Home',
    user:  req.user || null,
  });
});

/**
 * @swagger
 * /register:
 *   get:
 *     summary: Render register page
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Renders the user registration form
 */
router.get('/register', (req, res) => {
  res.render('pages/register', {
    title: 'Register — Netflix Clone',
    user:  null,
  });
});

/**
 * @swagger
 * /login:
 *   get:
 *     summary: Render login page
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Renders the user login form
 */
router.get('/login', (req, res) => {
  res.render('pages/login', {
    title: 'Login — Netflix Clone',
    user:  null,
  });
});

/**
 * @swagger
 * /forgot-password:
 *   get:
 *     summary: Render forgot password page
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Renders the forgot password form
 */
router.get('/forgot-password', (req, res) => {
  res.render('pages/forgot-password', {
    title: 'Forgot Password — Netflix Clone',
    user:  null,
  });
});

/**
 * @swagger
 * /reset-password/{token}:
 *   get:
 *     summary: Render reset password page
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token from email
 *     responses:
 *       200:
 *         description: Renders the reset password form
 */
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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       302:
 *         description: Registration successful — redirects to /browse
 *       400:
 *         description: Validation error or email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/auth/register', registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and set JWT cookie
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       302:
 *         description: Login successful — redirects to /browse or /admin
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/auth/login', loginUser);

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Logout user and clear JWT cookie
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       302:
 *         description: Logout successful — redirects to /login
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/logout', protectRoute, logoutUser);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send password reset email
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordInput'
 *     responses:
 *       200:
 *         description: Reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid email format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No account found with that email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/auth/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset user password using token
 *     tags: [Authentication]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token from email link
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       302:
 *         description: Password reset successful — redirects to /browse
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/auth/reset-password/:token', resetPassword);

module.exports = router;