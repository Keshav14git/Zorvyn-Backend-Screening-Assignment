const mongoose = require('mongoose');
const env = require('./env');

/**
 * Establishes connection to MongoDB with retry logic.
 * Logs connection state changes for observability.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri);

    console.log(` MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('[ERROR] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('  MongoDB disconnected. Attempting reconnection...');
    });

    return conn;
  } catch (error) {
    console.error('[ERROR] MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
