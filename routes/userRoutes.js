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
router.get('/profile', protectRoute, getProfile);
router.post('/api/users/profile', protectRoute, upload.single('avatar'), updateProfile);

// =====================
// Watchlist Routes
// =====================
router.get('/watchlist', protectRoute, getWatchlist);
router.post('/api/users/watchlist', protectRoute, addToWatchlist);
router.delete('/api/users/watchlist/:tmdbId', protectRoute, removeFromWatchlist);

module.exports = router;
