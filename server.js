const dotenv = require('dotenv');
const mongoose = require('mongoose');

const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { connectRedis, getRedisClient } = require('./src/config/redis');

dotenv.config();

const PORT = process.env.PORT;

// Graceful shutdown function
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  try {
    // Close database connections
    await mongoose.disconnect();
    console.log('🔴 MongoDB disconnected');

    // Close Redis connection
    const redisClient = getRedisClient();
    if (redisClient) {
      await redisClient.quit();
      console.log('🔴 Redis disconnected');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

(async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB connected');

    // Connect to Redis
    await connectRedis();
    console.log('✅ Redis connected');

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT} (${process.env.NODE_ENV})`);
    });

    // Graceful shutdown hooks
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();
