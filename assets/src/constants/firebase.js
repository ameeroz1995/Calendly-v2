/**
 * constants/firebase.js — Firebase configuration and timing constants.
 * Pure data, zero dependencies.
 */

/** Default timeout for Firebase operations (ms) */
export const FIREBASE_TIMEOUT_MS = 10000

/** Maximum wait time for transactions (ms) */
export const TRANSACTION_MAX_WAIT_MS = 30000

/** Firebase project config — overridden by Vite env vars in production */
export const FIREBASE_CONFIG = {
  apiKey:       window.__CALENDLY_API_KEY       || 'AIzaSy-placeholder',
  authDomain:   window.__CALENDLY_AUTH_DOMAIN   || 'calendly-v2.firebaseapp.com',
  databaseURL:  window.__CALENDLY_DATABASE_URL  || 'https://calendly-v2-default-rtdb.firebaseio.com',
  projectId:    window.__CALENDLY_PROJECT_ID    || 'calendly-v2',
}
