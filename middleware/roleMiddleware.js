const { AppError } = require('./errorMiddleware');
const logger       = require('../utils/logger');

// =====================
// Restrict To Roles
// (Role-Based Access Control)
// =====================
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by protectRoute middleware
    if (!req.user) {
      return next(
        new AppError('You are not logged in. Please log in to continue', 401)
      );
    }

    // Check if user role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(
        `Unauthorized access attempt by ${req.user.email} 
         with role: ${req.user.role}`
      );
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    logger.info(
      `Role check passed for ${req.user.email} — role: ${req.user.role}`
    );
    next();
  };
};

// =====================
// Is Admin
// (Shorthand for admin check)
// =====================
const isAdmin = restrictTo('admin');

// =====================
// Is User
// (Shorthand for user check)
// =====================
const isUser = restrictTo('user', 'admin');

module.exports = {
  restrictTo,
  isAdmin,
  isUser,
};