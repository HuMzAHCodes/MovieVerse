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

const loggerTransports = [];

// Only use file logging if we are not running on Vercel (read-only filesystem)
if (!process.env.VERCEL) {
  loggerTransports.push(
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new transports.File({
      filename: 'logs/combined.log',
    })
  );
}

// Always log to console on Vercel or in non-production environments
if (process.env.VERCEL || process.env.NODE_ENV !== 'production') {
  loggerTransports.push(
    new transports.Console({
      format: consoleFormat,
    })
  );
}

// Create the logger
const logger = createLogger({
  level: 'info',
  format: fileFormat,
  transports: loggerTransports,
});

module.exports = logger;