const express = require('express');
const {
  browsePage,
  movieDetailPage,
  searchPage,
  genrePage,
}             = require('../controllers/movieController');
const { protectRoute } = require('../middleware/authMiddleware');

const router = express.Router();

// =====================
// @route   GET /browse
// @desc    Main browse page
// @access  Private
// =====================
router.get('/browse', protectRoute, browsePage);

// =====================
// @route   GET /search
// @desc    Search movies
// @access  Private
// =====================
router.get('/search', protectRoute, searchPage);

// =====================
// @route   GET /genre/:genreId
// @desc    Movies by genre
// @access  Private
// =====================
router.get('/genre/:genreId', protectRoute, genrePage);

// =====================
// @route   GET /movie/:tmdbId
// @desc    Movie detail page
// @access  Private
// =====================
router.get('/movie/:tmdbId', protectRoute, movieDetailPage);

module.exports = router;