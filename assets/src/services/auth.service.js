/**
 * auth.service.js — Authentication service.
 *
 * Google OAuth via Firebase popup with redirect fallback.
 * User profile creation on first sign-in. All returns are AsyncResult.
 */

import { AsyncResult } from '../utils/Result.js'
import { getAuth } from '../firebase.js'
import { EventBus, MSG } from '../messages/catalog.js'
import { dbRef, dbRead, dbWrite, dbUpdate } from '../db.js'

const DEFAULTS = {
  plan: 'free',
  maxEventTypes: 1,
  maxCalendarConnections: 1,
  createdAt: null,
  updatedAt: null,
}

/**
 * Sign in with Google via popup. Falls back to redirect if popup blocked.
 * @returns {AsyncResult}
 */
export function signInWithGoogle() {
  return AsyncResult.from((async () => {
    const auth = getAuth()
    const { GoogleAuthProvider, signInWithPopup } = window._firebase
    const provider = new GoogleAuthProvider()
    try {
      return await signInWithPopup(auth, provider)
    } catch (e) {
      if (e.code === 'auth/popup-blocked') {
        const { signInWithRedirect } = window._firebase
        await signInWithRedirect(auth, provider)
        return null // Redirect will reload page
      }
      throw e
    }
  })())
}

/**
 * Sign out current user.
 * @returns {AsyncResult}
 */
export function signOut() {
  return AsyncResult.from((async () => {
    const { signOut: fbSignOut } = window._firebase
    await fbSignOut(getAuth())
    return true
  })())
}

/**
 * Get the currently signed-in user (sync).
 * @returns {Object|null} Firebase user or null
 */
export function getCurrentUser() {
  try {
    return getAuth().currentUser
  } catch (_) {
    return null
  }
}

/**
 * Create user profile in RTDB on first sign-in.
 * @param {string} uid — Firebase Auth UID
 * @param {Object} data — { displayName, email, photoURL }
 * @returns {AsyncResult}
 */
export function createUserProfile(uid, data) {
  return AsyncResult.from((async () => {
    const now = new Date().toISOString()
    const profile = {
      ...DEFAULTS,
      displayName: data.displayName || '',
      email: data.email || '',
      photoURL: data.photoURL || null,
      createdAt: now,
      updatedAt: now,
    }
    return await dbWrite(dbRef(`/users/${uid}`), profile).unwrapOrThrow()
  })())
}

/**
 * Get user profile from RTDB.
 * @param {string} uid
 * @returns {AsyncResult}
 */
export function getUserProfile(uid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/users/${uid}`)).unwrap()
    if (err) throw err
    return data || null
  })())
}

/**
 * Update user profile fields.
 * @param {string} uid
 * @param {Object} patch — partial profile data
 * @returns {AsyncResult}
 */
export function updateUserProfile(uid, patch) {
  return AsyncResult.from((async () => {
    patch.updatedAt = new Date().toISOString()
    return await dbUpdate(dbRef(`/users/${uid}`), patch).unwrapOrThrow()
  })())
}

/**
 * Listen for auth state changes.
 * @param {Function} cb — (user) => void
 * @returns {Function} unsubscribe
 */
export function onAuthChange(cb) {
  try {
    const { onAuthStateChanged } = window._firebase
    return onAuthStateChanged(getAuth(), (user) => {
      EventBus.emit(MSG.AUTH_CHANGED, { user: user || null })
      if (typeof cb === 'function') cb(user)
    })
  } catch (_) {
    return () => {}
  }
}
