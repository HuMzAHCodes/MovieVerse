const { verifyToken } = require('../utils/generateToken');
const User            = require('../models/User');
const { AppError }    = require('./errorMiddleware');
const logger          = require('../utils/logger');

// =====================
// Protect Routes
// (Verify JWT Token)
// =====================
const protectRoute = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookies first
    if (req.cookies.authToken) {
      token = req.cookies.authToken;
    }

    // Check for token in Authorization header as fallback
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

      // No token found — redirect to login
if (!token) {
  if (req.originalUrl.startsWith('/api')) {
    return next(
      new AppError('You are not logged in. Please log in to continue', 401)
    );
  }
  return res.redirect('/login');
}

    // Verify the token
    const decodedToken = verifyToken(token);

    // Check if user still exists in database
    const currentUser = await User.findById(decodedToken.id);
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists', 401)
      );
    }

    // Attach user to request object
    req.user = currentUser;

    logger.info(`Authenticated user: ${currentUser.email}`);
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token. Please log in again', 401));
  }
};

// =====================
// Optional Auth
// (Attach user if token
//  exists, but don't block)
// =====================
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies.authToken) {
      token = req.cookies.authToken;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decodedToken = verifyToken(token);
      const currentUser  = await User.findById(decodedToken.id);
      if (currentUser) {
        req.user = currentUser;
      }
    }

    next();
  } catch (error) {
    // If token is invalid just continue without user
    next();
  }
};

module.exports = {
  protectRoute,
  optionalAuth,
};