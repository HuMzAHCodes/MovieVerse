const User                    = require('../models/User');
const Watchlist               = require('../models/Watchlist');
const { AppError }            = require('../middleware/errorMiddleware');
const { generateToken,
        sendTokenCookie }     = require('../utils/generateToken');
const { updateProfileValidator } = require('../validators/userValidator');
const logger                  = require('../utils/logger');

// =====================
// @route   GET /profile
// @desc    View user profile page
// @access  Private
// =====================
const getProfile = (req, res) => {
  res.render('pages/profile', {
    title:   'My Profile — Netflix Clone',
    user:    req.user,
    error:   null,
    success: null,
  });
};

// =====================
// @route   POST /api/users/profile
// @desc    Update user profile name / avatar
// @access  Private
// =====================
const updateProfile = async (req, res, next) => {
  try {
    // Validate name from body
    const { error, value } = updateProfileValidator.validate(req.body);
    if (error) {
      return res.render('pages/profile', {
        title:   'My Profile — Netflix Clone',
        user:    req.user,
        error:   error.details[0].message,
        success: null,
      });
    }

    const { name } = value;

    // Find the user from DB
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update fields
    user.name = name;

    // If file was uploaded to Cloudinary via Multer, save secure path url
    if (req.file && req.file.path) {
      user.avatar = req.file.path;
    }

    await user.save();

    // Re-issue JWT cookie so the browser shows updated user info (header avatar / name)
    const token = generateToken({
      id:     user._id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      avatar: user.avatar,
    });
    sendTokenCookie(res, token);

    // Update user inside req for the rest of request cycle
    req.user = user;

    logger.info(`Profile updated for user: ${user.email}`);

    res.render('pages/profile', {
      title:   'My Profile — Netflix Clone',
      user:    user,
      error:   null,
      success: 'Profile updated successfully!',
    });

  } catch (err) {
    logger.error(`Profile update error: ${err.message}`);
    next(err);
  }
};

// =====================
// @route   GET /watchlist
// @desc    View user watchlist page
// @access  Private
// =====================
const getWatchlist = async (req, res, next) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.user.id });
    const movies    = watchlist ? watchlist.movies : [];

    res.render('pages/watchlist', {
      title:  'My List — Netflix Clone',
      user:   req.user,
      movies,
    });
  } catch (err) {
    logger.error(`Get watchlist error: ${err.message}`);
    next(err);
  }
};

// =====================
// @route   POST /api/users/watchlist
// @desc    Add a movie to user watchlist
// @access  Private
// =====================
const addToWatchlist = async (req, res, next) => {
  try {
    const { tmdbId, title, poster } = req.body;

    if (!tmdbId || !title || !poster) {
      return next(new AppError('Please provide tmdbId, title, and poster', 400));
    }

    // Find or create user watchlist
    let watchlist = await Watchlist.findOne({ user: req.user.id });
    if (!watchlist) {
      watchlist = new Watchlist({ user: req.user.id, movies: [] });
    }

    // Check if movie is already in list
    const isAlreadyAdded = watchlist.movies.some(
      (movie) => movie.tmdbId === parseInt(tmdbId)
    );

    if (isAlreadyAdded) {
      return res.status(200).json({
        success: true,
        message: 'Movie already in watchlist',
        movies:  watchlist.movies,
      });
    }

    watchlist.movies.push({
      tmdbId: parseInt(tmdbId),
      title,
      poster,
    });

    await watchlist.save();

    logger.info(`Movie ${tmdbId} added to watchlist for user ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Movie added to watchlist',
      movies:  watchlist.movies,
    });

  } catch (err) {
    logger.error(`Add to watchlist error: ${err.message}`);
    next(err);
  }
};

// =====================
// @route   DELETE /api/users/watchlist/:tmdbId
// @desc    Remove a movie from user watchlist
// @access  Private
// =====================
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;

    if (isNaN(tmdbId)) {
      return next(new AppError('Invalid movie ID', 400));
    }

    const watchlist = await Watchlist.findOne({ user: req.user.id });
    if (!watchlist) {
      return next(new AppError('Watchlist not found', 404));
    }

    // Filter out target movie
    watchlist.movies = watchlist.movies.filter(
      (movie) => movie.tmdbId !== parseInt(tmdbId)
    );

    await watchlist.save();

    logger.info(`Movie ${tmdbId} removed from watchlist for user ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Movie removed from watchlist',
      movies:  watchlist.movies,
    });

  } catch (err) {
    logger.error(`Remove from watchlist error: ${err.message}`);
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
};
