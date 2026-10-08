const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { getApps, cert, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getMessaging } = require('firebase-admin/messaging');

const logger = require('./logger');
const { get } = require('http');

dotenv.config();

let firebaseApp = null;

/**
 * Initialise the Firebase Admin SDK.
 * Uses GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON)
 * or falls back to Application Default Credentials.
 */
const initFirebase = () => {
  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
    logger.info('Firebase Admin SDK already initialised');
    return firebaseApp;
  }

  try {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    const options = {};

    if (credentialsPath) {
      const absolutePath = path.resolve(credentialsPath);
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Firebase service accont file not found at: ${absolutePath}`);
      }
      const serviceAccount = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
      options.credential = cert(serviceAccount);
      logger.info('Firebase Admin SDK using service account file');
    } else {
      logger.warn(
        'GOOGLE_APPLICATION_CREDENTIALS not set. Falling back to Application Default Credentials.'
      );
    }

    if (projectId) options.projectId = projectId;
    if (storageBucket) options.storageBucket = storageBucket;

    firebaseApp = initializeApp(options);
    logger.info(`Firebase Admin SDK initialised for project: ${firebaseApp.options.projectId}`);
    return firebaseApp;
  } catch (error) {
    logger.error(`Failed to initialise Firebase Admin SDK: ${error.message}`);
    throw error;
  }
};

/**
 * Verify a Firebase ID token.
 * @param {string} idToken
 * @returns {Promise<object>} decoded token
 */
const verifyIdToken = async (idToken) => {
  if (!firebaseApp) throw new Error('Firebase Admin SDK not initialised');
  return getAuth(firebaseApp).verifyIdToken(idToken);
};

/**
 * Ping Firebase Auth to confirm connectivity.
 * @returns {Promise<{ ok: boolean, message: string }>}
 */
const pingFirebase = async () => {
  try {
    if (!firebaseApp) return { ok: false, message: 'Firebase not initialised' };
    await getAuth(firebaseApp).listUsers(1);
    return { ok: true, message: 'Firebase Auth reachable' };
  } catch (error) {
    return { ok: false, message: `Firebase Auth error: ${error.message}` };
  }
};

const getFirebaseApp = () => firebaseApp;
const getFirebaseAuth = () => getAuth(firebaseApp);
const getFirebaseMessaging = () => getMessaging(firebaseApp);

module.exports = {
  initFirebase,
  verifyIdToken,
  pingFirebase,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseMessaging,
};
