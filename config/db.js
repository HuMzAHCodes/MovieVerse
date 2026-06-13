const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Extract database connection URI from environment variables
const DATABASE_URI = process.env.MONGO_URI;

// Mongoose connection options
const connectionOptions = {
  autoIndex: true,        // Build indexes automatically
  maxPoolSize: 10,        // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds if no server found
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(DATABASE_URI, connectionOptions);

    logger.info(`MongoDB Atlas connected: ${connection.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    // Exit process with failure if database connection fails
    process.exit(1);
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

// Gracefully close connection when app is terminated
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDatabase;