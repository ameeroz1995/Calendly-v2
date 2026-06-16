/**
 * db.js — Firebase RTDB helpers (shared, no circular deps).
 *
 * Extracted from firebase.js so both firebase.js and services/ can import
 * without dynamic-import workarounds. firebase.js calls initRtdb() once
 * during startup; after that all helpers use the stored reference.
 *
 * firebase.js re-exports everything for backward compatibility.
 */

import { AsyncResult } from './utils/Result.js'
import { FIREBASE_TIMEOUT_MS } from './constants/firebase.js'

const fb = window._firebase

// ── Lazy RTDB reference (set by firebase.js init) ────────────────

let _rtdb = null

/** Called once by firebase.js after Firebase is initialized. */
export function initRtdb(rtdb) {
  _rtdb = rtdb
}

// ── Reference builder ────────────────────────────────────────────

/** Build a DatabaseReference from a path string. */
function dbRef(path) {
  return fb.ref(_rtdb, path)
}

// ── Timeout helpers (exported for use by firebase.js / tests) ────

/** Create an AbortController that auto-aborts after `ms` milliseconds. */
function withTimeout(ms = FIREBASE_TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return { controller, timer }
}

/** Create a promise that rejects on AbortSignal abort. */
function timeoutRejection(signal, label) {
  return new Promise((_, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort)
      reject(new Error(label + ' timeout after ' + FIREBASE_TIMEOUT_MS + 'ms'))
    }
    signal.addEventListener('abort', onAbort)
  })
}

/**
 * Read data at a path. Returns AsyncResult wrapping a DataSnapshot.
 *
 *   const [snapshot, err] = await dbRead('/users/' + uid).unwrap()
 *   if (err) { ... handle error ... }
 */
function dbRead(path) {
  return AsyncResult.from(async () => {
    const { controller, timer } = withTimeout()
    try {
      const snapshot = await Promise.race([
        fb.get(dbRef(path)),
        timeoutRejection(controller.signal, 'Firebase read')
      ])
      return snapshot
    } finally {
      clearTimeout(timer)
    }
  })
}

/**
 * Write (set) data at a path. Idempotent — uses set() with known key.
 * Returns AsyncResult wrapping true on success.
 */
function dbWrite(path, data) {
  return AsyncResult.from(async () => {
    const { controller, timer } = withTimeout()
    try {
      await Promise.race([
        fb.set(dbRef(path), data),
        timeoutRejection(controller.signal, 'Firebase write')
      ])
      return true
    } finally {
      clearTimeout(timer)
    }
  })
}

/**
 * Update (merge) data at a path. Returns AsyncResult.
 */
function dbUpdate(path, data) {
  return AsyncResult.from(async () => {
    const { controller, timer } = withTimeout()
    try {
      await Promise.race([
        fb.update(dbRef(path), data),
        timeoutRejection(controller.signal, 'Firebase update')
      ])
      return true
    } finally {
      clearTimeout(timer)
    }
  })
}

/**
 * Remove data at a path. Returns AsyncResult.
 */
function dbRemove(path) {
  return AsyncResult.from(async () => {
    const { controller, timer } = withTimeout()
    try {
      await Promise.race([
        fb.remove(dbRef(path)),
        timeoutRejection(controller.signal, 'Firebase remove')
      ])
      return true
    } finally {
      clearTimeout(timer)
    }
  })
}

/**
 * Atomic transaction with max-wait guard.
 * The updateFn receives the current value and must return the new value
 * (or undefined to abort the transaction).
 *
 *   const [committed, err] = await dbTransaction(
 *     '/counters/uid',
 *     (val) => ({ count: (val?.count || 0) + 1 })
 *   ).unwrap()
 */
function dbTransaction(path, updateFn) {
  return AsyncResult.from(async () => {
    const { controller, timer } = withTimeout(FIREBASE_TIMEOUT_MS)
    try {
      const result = await Promise.race([
        fb.runTransaction(dbRef(path), updateFn),
        timeoutRejection(controller.signal, 'Firebase transaction')
      ])
      return result
    } finally {
      clearTimeout(timer)
    }
  })
}

/**
 * Subscribe to real-time value changes at a path.
 * Returns an unsubscribe function.
 *
 *   const unsub = onValueSubscription('/slots/uid/date', (snapshot) => { ... })
 *   // later: unsub()
 */
function onValueSubscription(path, callback) {
  const ref = dbRef(path)
  return fb.onValue(ref, callback)
}

export {
  dbRef,
  dbRead,
  dbWrite,
  dbUpdate,
  dbRemove,
  dbTransaction,
  onValueSubscription,
  withTimeout,
}
