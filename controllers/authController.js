const crypto                  = require('crypto');
const User                    = require('../models/User');
const { AppError }            = require('../middleware/errorMiddleware');
const { generateToken,
        sendTokenCookie,
        clearTokenCookie }    = require('../utils/generateToken');
const { sendWelcomeEmail,
        sendPasswordResetEmail } = require('../utils/email');
const { registerValidator,
        loginValidator,
        forgotPasswordValidator,
        resetPasswordValidator } = require('../validators/authValidator');
const logger                  = require('../utils/logger');

// =====================
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// =====================
const registerUser = async (req, res, next) => {
  try {
    // Validate request body with Joi
    const { error, value } = registerValidator.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(', ');
      return next(new AppError(errorMessages, 400));
    }

    const { name, email, password } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered. Please log in', 400));
    }

    // Create new user

const newUser = await User.create({ name, email, password });


// Generate JWT token

const token = generateToken({
      id:    newUser._id,
      name:  newUser.name,
      email: newUser.email,
      role:  newUser.role,
    });

    // Send token in cookie
sendTokenCookie(res, token);

// Send welcome email (non-blocking)
sendWelcomeEmail(newUser).catch((emailError) => {
  logger.error(`Welcome email failed: ${emailError.message}`);
});

logger.info(`New user registered: ${newUser.email}`);

// Debug — remove after fix


// Redirect to browse page
return res.status(201).redirect('/browse');

  } catch (error) {
    logger.error(`Register error: ${error.message}`);
    return next(error);
  }
};
// =====================
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// =====================
const loginUser = async (req, res, next) => {
  try {
    // Validate request body with Joi
    const { error, value } = loginValidator.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(', ');
      return next(new AppError(errorMessages, 400));
    }

    const { email, password } = value;

    // Find user and include password for comparison
    const existingUser = await User.findOne({ email }).select('+password');
    if (!existingUser) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Compare entered password with hashed password
    const isPasswordCorrect = await existingUser.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate JWT token
    const token = generateToken({
      id:    existingUser._id,
      name:  existingUser.name,
      email: existingUser.email,
      role:  existingUser.role,
    });

    // Send token in cookie
    sendTokenCookie(res, token);

    logger.info(`User logged in: ${existingUser.email}`);

    // Redirect based on role
    if (existingUser.role === 'admin') {
      return res.redirect('/admin');
    }
    res.redirect('/browse');
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

// =====================
// @route   GET /logout
// @desc    Logout user
// @access  Private
// =====================
const logoutUser = (req, res, next) => {
  try {
    // Clear the auth cookie
    clearTokenCookie(res);

    logger.info(`User logged out`);

    res.redirect('/login');
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    next(error);
  }
};

// =====================
// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
// =====================
const forgotPassword = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = forgotPasswordValidator.validate(req.body);
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    const { email } = value;

    // Find user by email
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return next(new AppError('No account found with that email address', 404));
    }

    // Generate reset token
    const resetToken        = crypto.randomBytes(32).toString('hex');

    // Hash token before saving to database
    existingUser.resetPasswordToken  = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiry to 10 minutes
    existingUser.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await existingUser.save({ validateBeforeSave: false });

    // Send reset email
    await sendPasswordResetEmail(existingUser, resetToken);

    logger.info(`Password reset email sent to: ${existingUser.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    next(error);
  }
};

// =====================
// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
// =====================
const resetPassword = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = resetPasswordValidator.validate(req.body);
    if (error) {
      return next(new AppError(error.details[0].message, 400));
    }

    // Hash the token from URL to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with valid token that hasn't expired
    const existingUser = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!existingUser) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    // Update password
    existingUser.password            = value.password;
    existingUser.resetPasswordToken  = undefined;
    existingUser.resetPasswordExpire = undefined;

    await existingUser.save();

    // Generate new JWT and log user in
    const token = generateToken({
      id:    existingUser._id,
      name:  existingUser.name,
      email: existingUser.email,
      role:  existingUser.role,
    });

    sendTokenCookie(res, token);

    logger.info(`Password reset successful for: ${existingUser.email}`);

    res.redirect('/browse');
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
};