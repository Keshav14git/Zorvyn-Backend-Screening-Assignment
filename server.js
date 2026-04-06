const app = require('./src/app');
const connectDB = require('./src/config/db');
const env = require('./src/config/env');

/**
 * Application entry point.
 * Connects to MongoDB first, then starts the HTTP server.
 * Handles unhandled rejections and uncaught exceptions gracefully.
 */
const startServer = async () => {
  // 1. Connect to database
  await connectDB();

  // 2. Start HTTP server
  const server = app.listen(env.port, () => {
    console.log(`\n Server running in ${env.nodeEnv} mode on port ${env.port}`);
    console.log(` Health check: http://localhost:${env.port}/api/health\n`);
  });

  // Graceful Shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Unhandled Error Safety Nets
  process.on('unhandledRejection', (reason) => {
    console.error('[ERROR] Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (error) => {
    console.error('[ERROR] Uncaught Exception:', error);
    server.close(() => process.exit(1));
  });
};

startServer();
