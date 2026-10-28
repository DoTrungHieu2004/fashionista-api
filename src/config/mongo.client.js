'use strict';

const mongoose = require('mongoose');

const env = require('./env');
const logger = require('../logging/logger');

let listenersAttached = false;

const attachLifecyckeListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  const conn = mongoose.connection;
  conn.on('connected', () => logger.info({ db: conn.name }, 'MongoDB connected'));
  conn.on('disconnected', () => logger.warn('MongoDB disconnected'));
  conn.on('reconnected', (err) => logger.error({ err }, 'MongoDB connection error'));
};

/**
 * Connect to MongoDB. Safe to call once at startup.
 * Throws on failure so the caller can fail fast.
 */
const connectMongo = async () => {
  if (!env.mongo.uri) {
    throw new Error('MONGODB_URI is not set');
  }

  attachLifecyckeListeners();

  // Fail loud on unknown paths in queries.
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongo.uri, {
    dbName: env.mongo.dbName || undefined,
    maxPoolSize: env.mongo.maxPoolSize,
    serverSelectionTimeoutMS: 5_000,
    socketTimeoutMS: 45_000,
    // Indexes are built explicitly via migrations in production.
    autoIndex: !env.isProduction,
  });

  return mongoose.connection;
};

const disconnectMongo = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};

/**
 * Readiness check: fast state gate + real ping round-trip.
 * The ping catches “connection silently dropped but readyState stale” cases.
 */
const checkMongoHealth = async () => {
  if (mongoose.connection.readyState !== 1) {
    return { status: 'down', error: `readyState=${mongoose.connection.readyState}` };
  }
  try {
    await mongoose.connection.db.command({ ping: 1 });
    return { status: 'ok' };
  } catch (error) {
    return { status: 'down', error: error.message };
  }
};

module.exports = { connectMongo, disconnectMongo, checkMongoHealth, mongoose };
