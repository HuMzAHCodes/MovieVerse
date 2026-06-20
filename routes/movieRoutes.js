const express = require('express');
const {
  browsePage,
  movieDetailPage,
  searchPage,
  genrePage,
}             = require('../controllers/movieController');
const { protectRoute } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /browse:
 *   get:
 *     summary: Main browse page
 *     description: Returns the Netflix-style browse page with Trending, Popular, and Top Rated movie rows fetched from TMDB API.
 *     tags: [Movies]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Renders the browse page with movie categories
 *       302:
 *         description: Redirects to /login if not authenticated
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/browse', protectRoute, browsePage);

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search movies
 *     description: Search for movies using the TMDB API with pagination support.
 *     tags: [Movies]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query term
 *         example: batman
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *     responses:
 *       200:
 *         description: Renders search results page
 *       302:
 *         description: Redirects to /login if not authenticated
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/search', protectRoute, searchPage);

/**
 * @swagger
 * /genre/{genreId}:
 *   get:
 *     summary: Browse movies by genre
 *     description: Returns movies filtered by a TMDB genre ID with pagination support.
 *     tags: [Movies]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: genreId
 *         required: true
 *         schema:
 *           type: integer
 *         description: TMDB genre ID (e.g. 28 for Action, 35 for Comedy)
 *         example: 28
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *     responses:
 *       200:
 *         description: Renders genre page with filtered movies
 *       302:
 *         description: Redirects to /login if not authenticated
 *       400:
 *         description: Invalid genre ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/genre/:genreId', protectRoute, genrePage);

/**
 * @swagger
 * /movie/{tmdbId}:
 *   get:
 *     summary: Movie detail page
 *     description: Returns full movie details including cast, runtime, genres, and embedded YouTube trailer fetched from TMDB API.
 *     tags: [Movies]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tmdbId
 *         required: true
 *         schema:
 *           type: integer
 *         description: TMDB movie ID
 *         example: 550
 *     responses:
 *       200:
 *         description: Renders movie detail page with trailer
 *       302:
 *         description: Redirects to /login if not authenticated
 *       400:
 *         description: Invalid movie ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Movie not found on TMDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/movie/:tmdbId', protectRoute, movieDetailPage);

module.exports = router;