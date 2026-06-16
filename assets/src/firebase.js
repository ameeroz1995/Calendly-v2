/**
 * firebase.js — Firebase SDK init, auth helpers, and DB helper re-exports.
 *
 * Initializes the Firebase app from constants/firebase.js config.
 * DB helpers (dbRead, dbWrite, etc.) live in db.js to avoid circular
 * imports with services/. Re-exported here for backward compatibility.
 */

import { FIREBASE_CONFIG } from './constants/firebase.js'
import { initRtdb } from './db.js'

const fb = window._firebase

// ── Initialize Firebase ──────────────────────────────────────────

const app = fb.initializeApp(FIREBASE_CONFIG)
const auth = fb.getAuth(app)
const rtdb = fb.getDatabase(app)

// Wire db.js helpers to the initialized RTDB instance
initRtdb(rtdb)

// Expose for non-module scripts that reference window._firebaseApp
window._firebaseApp = app

// ── Auth helpers ─────────────────────────────────────────────────

/** Getter for auth instance. */
function getAuth() {
  return auth
}

/** Getter for RTDB instance. */
function getRtdb() {
  return rtdb
}

export {
  auth,
  rtdb,
  getAuth,
  getRtdb,
}

// ── Re-export all DB helpers from db.js (backward compat) ────────
export {
  dbRef,
  dbRead,
  dbWrite,
  dbUpdate,
  dbRemove,
  dbTransaction,
  onValueSubscription,
  withTimeout,
} from './db.js'
