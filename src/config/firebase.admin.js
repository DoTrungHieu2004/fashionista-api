'use strict';

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const env = require('./env');
const logger = require('../logging/logger');

let initialized = false;
let lastError = null;

/**
 * Initialise the Firebase Admin SDK once.
 * Safe to call multiple times — subsequent calls are no-ops.
 * Returns `true` if the SDK is ready, `false` otherwise.
 */
const initFirebaseAdmin = () => {
  if (initialized) return true;

  const { projectId, clientEmail, privateKey, databaseURL, storageBucket } = env.firebase;

  if (!projectId || !clientEmail || !privateKey) {
    lastError = new Error(
      'Firebase Admin credentials are incomplete. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
    );
    logger.warn({ err: lastError }, 'Firebase Admin SDK not initialised');
    return false;
  }

  try {
    // getApps() always returns an array — no null dereference risk.
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        databaseURL,
        storageBucket,
      });
    }
    initialized = true;
    lastError = null;
    logger.info({ projectId }, 'Firebase Admin SDK initialised');
    return true;
  } catch (error) {
    lastError = error;
    logger.error({ error }, 'Firebase Admin SDK initialisation failed');
    return false;
  }
};

/**
 * Lightweight, authenticated round-trip to Firebase Auth.
 * Uses a UID guaranteed not to exist, so a "user-not-found" error
 * actually proves the SDK is connected and authenticating correctly.
 */
const checkFirebaseHealth = async () => {
  if (!initialized) {
    return { status: 'down', error: lastError?.message || 'not initialised' };
  }

  try {
    await getAuth().getUser('health-probe-nonexistent-uid');
    // If a user with this UID somehow exists, the round-trip still succeeded.
    return { status: 'ok' };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      // Expected: SDK is connected and authenticated.
      return { status: 'ok' };
    }
    return { status: 'down', error: error.message };
  }
};

module.exports = { initFirebaseAdmin, checkFirebaseHealth };
