const express          = require('express');
const {
  getProfile,
  updateProfile,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
}                      = require('../controllers/userController');
const { protectRoute } = require('../middleware/authMiddleware');
const { upload }       = require('../config/cloudinary');

const router = express.Router();

// =====================
// Profile Routes
// =====================

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: View user profile
 *     description: Renders the profile page for the currently authenticated user.
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Renders the profile page
 *       302:
 *         description: Redirects to /login if not authenticated
 */
router.get('/profile', protectRoute, getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   post:
 *     summary: Update user profile
 *     description: Updates the authenticated user's name and/or avatar image. Avatar is uploaded to Cloudinary via Multer.
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Jane Doe
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (jpg, png, etc.)
 *     responses:
 *       200:
 *         description: Profile updated successfully — re-renders profile page with success message
 *       400:
 *         description: Validation error — name too short or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       302:
 *         description: Redirects to /login if not authenticated
 */
router.post('/api/users/profile', protectRoute, upload.single('avatar'), updateProfile);

// =====================
// Watchlist Routes
// =====================

/**
 * @swagger
 * /watchlist:
 *   get:
 *     summary: View user watchlist
 *     description: Renders the My List page showing all movies the authenticated user has saved.
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Renders the watchlist page with saved movies
 *       302:
 *         description: Redirects to /login if not authenticated
 */
router.get('/watchlist', protectRoute, getWatchlist);

/**
 * @swagger
 * /api/users/watchlist:
 *   post:
 *     summary: Add movie to watchlist
 *     description: Adds a movie to the authenticated user's watchlist. Only the TMDB ID, title, and poster are stored — full movie data is fetched live from TMDB.
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToWatchlistInput'
 *     responses:
 *       201:
 *         description: Movie added to watchlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       200:
 *         description: Movie already exists in watchlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       302:
 *         description: Redirects to /login if not authenticated
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/api/users/watchlist', protectRoute, addToWatchlist);

/**
 * @swagger
 * /api/users/watchlist/{tmdbId}:
 *   delete:
 *     summary: Remove movie from watchlist
 *     description: Removes a specific movie from the authenticated user's watchlist using the TMDB movie ID.
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tmdbId
 *         required: true
 *         schema:
 *           type: integer
 *         description: TMDB movie ID to remove from watchlist
 *         example: 550
 *     responses:
 *       200:
 *         description: Movie removed from watchlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       302:
 *         description: Redirects to /login if not authenticated
 *       404:
 *         description: Movie not found in watchlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/api/users/watchlist/:tmdbId', protectRoute, removeFromWatchlist);

module.exports = router;