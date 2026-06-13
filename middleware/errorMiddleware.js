const logger = require('../utils/logger');

// =====================
// Custom Error Class
// =====================
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status     = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Marks it as a known/expected error

    Error.captureStackTrace(this, this.constructor);
  }
}

// =====================
// Handle Cast Errors
// (Invalid MongoDB IDs)
// =====================
const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

// =====================
// Handle Duplicate Key
// (e.g. duplicate email)
// =====================
const handleDuplicateKeyError = (error) => {
  const field   = Object.keys(error.keyValue)[0];
  const message = `${field} already exists. Please use a different ${field}`;
  return new AppError(message, 400);
};

// =====================
// Handle Validation Errors
// (Mongoose schema errors)
// =====================
const handleValidationError = (error) => {
  const messages = Object.values(error.errors)
    .map((err) => err.message)
    .join(', ');
  return new AppError(`Validation failed: ${messages}`, 400);
};

// =====================
// Handle JWT Errors
// =====================
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Token expired. Please log in again', 401);

// =====================
// Send Error Response
// =====================
const sendErrorResponse = (err, req, res) => {
  // API requests return JSON
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      success: false,
      status:  err.status,
      message: err.message,
    });
  }

  // Page requests render error page
  return res.status(err.statusCode).render('pages/home', {
    title:   'Something went wrong',
    message: err.message,
  });
};

// =====================
// Global Error Handler
// (Must have 4 params)
// =====================
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status     = err.status     || 'error';

  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl}`);

  // Handle specific error types
  let handledError = { ...err, message: err.message };

  if (err.name === 'CastError')             handledError = handleCastError(err);
  if (err.code  === 11000)                  handledError = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError')       handledError = handleValidationError(err);
  if (err.name === 'JsonWebTokenError')     handledError = handleJWTError();
  if (err.name === 'TokenExpiredError')     handledError = handleJWTExpiredError();

  sendErrorResponse(handledError, req, res);
};

// =====================
// 404 Not Found Handler
// =====================
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
};

module.exports = {
  AppError,
  globalErrorHandler,
  notFoundHandler,
};