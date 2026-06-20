const User        = require('../models/User');
const Watchlist   = require('../models/Watchlist');
const { AppError } = require('../middleware/errorMiddleware');
const logger      = require('../utils/logger');

// =====================
// @route   GET /admin
// @desc    Admin dashboard page
// @access  Private (Admin only)
// =====================
const getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers   = await User.countDocuments();
    const adminUsers   = await User.countDocuments({ role: 'admin' });
    const regularUsers = totalUsers - adminUsers;

    // Fetch total saved movies across all watchlists in database
    const watchlists = await Watchlist.find();
    let totalWatchlistMovies = 0;
    watchlists.forEach((wl) => {
      totalWatchlistMovies += wl.movies.length;
    });

    // Fetch 5 most recent registrations
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('pages/admin/dashboard', {
      title: 'Admin Dashboard — Netflix Clone',
      user:  req.user,
      stats: {
        totalUsers,
        adminUsers,
        regularUsers,
        totalWatchlistMovies,
      },
      recentUsers,
    });

  } catch (err) {
    logger.error(`Admin dashboard error: ${err.message}`);
    next(err);
  }
};

// =====================
// @route   GET /admin/users
// @desc    View all users page
// @access  Private (Admin only)
// =====================
const getUsersList = async (req, res, next) => {
  try {
    // Get all registered users
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.render('pages/admin/users', {
      title:   'User Management — Netflix Clone',
      user:    req.user,
      users,
      error:   null,
      success: null,
    });

  } catch (err) {
    logger.error(`Admin get users list error: ${err.message}`);
    next(err);
  }
};

// =====================
// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
// =====================
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Prevent administrators from deleting themselves
    if (userId === req.user.id.toString()) {
      return next(new AppError('You cannot delete your own admin account', 400));
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return next(new AppError('User not found', 404));
    }

    // Delete corresponding watchlist document if exists
    await Watchlist.deleteOne({ user: userId });

    // Delete target user document
    await User.findByIdAndDelete(userId);

    logger.info(`User ${userToDelete.email} deleted by Admin ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: `User ${userToDelete.name} has been deleted successfully`,
    });

  } catch (err) {
    logger.error(`Admin delete user error: ${err.message}`);
    next(err);
  }
};

module.exports = {
  getAdminDashboard,
  getUsersList,
  deleteUser,
};
