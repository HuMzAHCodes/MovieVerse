const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf, colorize, errors } = format;

// Custom format for log messages
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Console format with colors (for development)
const consoleFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  logFormat
);

// File format without colors
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  logFormat
);

// File transports
const errorFileTransport = new transports.File({
  filename: 'logs/error.log',
  level: 'error',
});

const combinedFileTransport = new transports.File({
  filename: 'logs/combined.log',
});

// Console transport (only in development)
const consoleTransport = new transports.Console({
  format: consoleFormat,
});

// Create the logger
const logger = createLogger({
  level: 'info',
  format: fileFormat,
  transports: [errorFileTransport, combinedFileTransport],
});

// Add console logging in development mode
if (process.env.NODE_ENV !== 'production') {
  logger.add(consoleTransport);
}

module.exports = logger;