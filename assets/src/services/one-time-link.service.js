/**
 * one-time-link.service.js — Single-use booking tokens.
 *
 * Time-limited, expire-after-use tokens for secure booking invitations.
 * RTDB: /one_time_links/{token}
 * Route: /book/otl/{token}
 *
 * Token auto-expires after booking or TTL (default 7 days).
 */

import { AsyncResult } from '../utils/Result.js'
import { dbRef, dbRead, dbWrite, dbUpdate, dbRemove } from '../firebase.js'
import { generateRandomHex } from '../utils/crypto.js'

/** Default TTL: 7 days */
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Generate a single-use booking link.
 *
 * @param {string} hostId — host UID
 * @param {string} eventTypeId — event type to book
 * @param {Object} opts
 * @param {number} [opts.ttlMs] — time-to-live in ms (default 7 days)
 * @param {number} [opts.maxUses=1] — max uses before expiry
 * @param {string} [opts.recipientEmail] — optional: lock to specific email
 * @returns {AsyncResult}
 */
export function createOneTimeLink(hostId, eventTypeId, opts = {}) {
  return AsyncResult.from((async () => {
    const ttlMs = opts.ttlMs || DEFAULT_TTL_MS
    const maxUses = opts.maxUses || 1
    const token = 'otl_' + generateRandomHex(16)
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + ttlMs).toISOString()

    await dbWrite(dbRef(`/one_time_links/${token}`), {
      token,
      hostId,
      eventTypeId,
      isUsed: false,
      useCount: 0,
      maxUses,
      recipientEmail: opts.recipientEmail || null,
      createdAt: now,
      expiresAt,
      usedAt: null,
      usedBy: null,
    }).unwrapOrThrow()

    const bookUrl = `${window.location.origin}/#/book/otl/${token}`

    return {
      token,
      url: bookUrl,
      expiresAt,
      maxUses,
    }
  })())
}

/**
 * Validate and consume a one-time link token.
 * Checks: exists, not expired, not maxed out, not already used.
 *
 * @param {string} token — the token from the URL
 * @param {string} [userEmail] — optional email to validate recipient lock
 * @returns {AsyncResult} resolving to { hostId, eventTypeId, valid:true }
 */
export function validateOneTimeLink(token, userEmail) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/one_time_links/${token}`)).unwrap()
    if (err) throw err
    if (!data) throw new Error('Invalid link. This booking link does not exist.')

    // Check expiry
    if (new Date(data.expiresAt).getTime() < Date.now()) {
      throw new Error('This booking link has expired.')
    }

    // Check use count
    if (data.useCount >= data.maxUses) {
      throw new Error('This booking link has already been used.')
    }

    // Check recipient lock
    if (data.recipientEmail && userEmail && data.recipientEmail !== userEmail) {
      throw new Error('This booking link is intended for a different recipient.')
    }

    return {
      valid: true,
      hostId: data.hostId,
      eventTypeId: data.eventTypeId,
      token,
    }
  })())
}

/**
 * Mark a one-time link as used (consumed).
 * Called after a successful booking.
 *
 * @param {string} token
 * @param {string} usedBy — invitee email or UID
 * @returns {AsyncResult}
 */
export function consumeOneTimeLink(token, usedBy) {
  return AsyncResult.from((async () => {
    const [link, err] = await dbRead(dbRef(`/one_time_links/${token}`)).unwrap()
    if (err) throw err
    if (!link) throw new Error('Token not found')

    const now = new Date().toISOString()
    const newUseCount = (link.useCount || 0) + 1
    const isUsed = newUseCount >= (link.maxUses || 1)

    await dbUpdate(dbRef(`/one_time_links/${token}`), {
      useCount: newUseCount,
      isUsed,
      usedAt: now,
      usedBy: usedBy || null,
    }).unwrapOrThrow()

    return { consumed: true, remaining: Math.max(0, (link.maxUses || 1) - newUseCount) }
  })())
}

/**
 * List all one-time links for a host.
 *
 * @param {string} hostId
 * @returns {AsyncResult}
 */
export function listOneTimeLinks(hostId) {
  return AsyncResult.from((async () => {
    const [all, err] = await dbRead(dbRef('/one_time_links')).unwrap()
    if (err) throw err
    if (!all) return []
    return Object.values(all)
      .filter(l => l.hostId === hostId)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  })())
}

/**
 * Revoke (delete) a one-time link.
 *
 * @param {string} token
 * @returns {AsyncResult}
 */
export function revokeOneTimeLink(token) {
  return AsyncResult.from((async () => {
    await dbRemove(dbRef(`/one_time_links/${token}`)).unwrapOrThrow()
    return true
  })())
}

/**
 * Clean up expired tokens.
 * Called periodically or by admin action.
 *
 * @returns {AsyncResult} resolving to number of tokens cleaned up
 */
export function cleanupExpiredTokens() {
  return AsyncResult.from((async () => {
    const [all, err] = await dbRead(dbRef('/one_time_links')).unwrap()
    if (err) throw err
    if (!all) return 0

    const now = Date.now()
    const expired = Object.values(all).filter(l =>
      new Date(l.expiresAt).getTime() < now || l.isUsed
    )

    for (const link of expired) {
      await dbRemove(dbRef(`/one_time_links/${link.token}`)).unwrapOrThrow()
    }

    console.log(`[otl] cleaned up ${expired.length} expired tokens`)
    return expired.length
  })())
}
