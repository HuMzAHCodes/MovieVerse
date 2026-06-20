const mongoose = require('mongoose');
const logger = require('../utils/logger');

const DATABASE_URI = process.env.MONGO_URI;

const connectionOptions = {
  autoIndex: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) return;

  if (!DATABASE_URI) {
    throw new Error('MONGO_URI environment variable is not defined');
  }

  try {
    const connection = await mongoose.connect(DATABASE_URI, connectionOptions);
    isConnected = true;
    logger.info(`MongoDB Atlas connected: ${connection.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    // ★ NEVER call process.exit() in serverless — it kills the function
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

if (!process.env.VERCEL) {
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed due to app termination');
    process.exit(0);
  });
}

module.exports = connectDatabase;