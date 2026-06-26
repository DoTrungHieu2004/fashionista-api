const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config();

let redisClient = null;

const connectRedis = async () => {
  const url = process.env.REDIS_URL;
  redisClient = createClient({ url });

  redisClient.on('error', (err) => console.error('❌ Redis client error', err));
  redisClient.on('connect', () => console.log('🛜 Redis client connected'));

  await redisClient.connect();
  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) throw new Error('Redis client not initialized');
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
