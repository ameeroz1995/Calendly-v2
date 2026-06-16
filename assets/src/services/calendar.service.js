/**
 * calendar.service.js — External calendar connections.
 *
 * OAuth flow for Google + Microsoft via Cloud Function token exchange.
 * Tokens never stored in client-readable form. MAX_CONNECTIONS=10.
 */

import { AsyncResult } from '../utils/Result.js'
import { dbRef, dbRead, dbWrite, dbUpdate, dbRemove } from '../db.js'
import { generateRandomHex } from '../utils/crypto.js'
import { markSlotExternalBusy } from './availability.service.js'

const MAX_CONNECTIONS = 10
const PROVIDERS = ['google', 'microsoft']

/**
 * Initiate OAuth connection to a calendar provider.
 * Generates CSRF state param, stores pending state, opens OAuth URL.
 *
 * @param {string} uid — user ID
 * @param {string} provider — 'google' | 'microsoft'
 * @returns {AsyncResult}
 */
export function connectCalendar(uid, provider) {
  return AsyncResult.from((async () => {
    if (!PROVIDERS.includes(provider)) throw new Error('Unsupported provider: ' + provider)

    // Enforce max connections
    const [existing, listErr] = await listConnections(uid).unwrap()
    if (listErr) throw listErr
    if ((existing || []).filter(c => c.status === 'active').length >= MAX_CONNECTIONS) {
      throw new Error(`Maximum ${MAX_CONNECTIONS} calendar connections reached`)
    }

    const state = 'cal_' + generateRandomHex(16)
    // Store state for CSRF validation
    await dbWrite(dbRef(`/calendar_connections/${uid}/_pending`), {
      state,
      provider,
      createdAt: new Date().toISOString(),
    }).unwrapOrThrow()

    // Build OAuth URL (Cloud Function handles the actual token exchange)
    const redirectUri = `${window.location.origin}/api/oauth/callback`
    const clientId = provider === 'google'
      ? (window.__GOOGLE_CLIENT_ID || 'placeholder')
      : (window.__MICROSOFT_CLIENT_ID || 'placeholder')

    let authUrl
    if (provider === 'google') {
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/calendar.events%20https://www.googleapis.com/auth/calendar.readonly&access_type=offline&prompt=consent&state=${state}`
    } else {
      authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=Calendars.ReadWrite%20offline_access&state=${state}`
    }

    // Redirect to OAuth provider
    window.location.href = authUrl
    return { redirect: authUrl }
  })())
}

/**
 * Handle OAuth callback (called by Cloud Function after token exchange).
 * The actual token exchange happens server-side; client stores the connection metadata.
 *
 * @param {string} uid
 * @param {string} provider
 * @param {string} email — calendar email
 * @returns {AsyncResult}
 */
export function finalizeConnection(uid, provider, email) {
  return AsyncResult.from((async () => {
    const cid = 'cal_' + generateRandomHex(8)
    const now = new Date().toISOString()
    await dbWrite(dbRef(`/calendar_connections/${uid}/${cid}`), {
      cid,
      provider,
      email,
      status: 'active',
      lastSync: now,
      createdAt: now,
    }).unwrapOrThrow()

    // Clean up pending state
    await dbRemove(dbRef(`/calendar_connections/${uid}/_pending`)).unwrapOrThrow()
    return cid
  })())
}

/**
 * Disconnect a calendar.
 * @param {string} uid
 * @param {string} cid
 * @returns {AsyncResult}
 */
export function disconnectCalendar(uid, cid) {
  return AsyncResult.from((async () => {
    // Remove the connection node (tokens + metadata) entirely
    await dbRemove(dbRef(`/calendar_connections/${uid}/${cid}`)).unwrapOrThrow()
    // Clean up any synced availability slots for this connection
    await dbRemove(dbRef(`/calendar_synced_slots/${uid}/${cid}`)).unwrapOrThrow()
    return true
  })())
}

/**
 * List all calendar connections for a user.
 * @param {string} uid
 * @returns {AsyncResult}
 */
export function listConnections(uid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/calendar_connections/${uid}`)).unwrap()
    if (err) throw err
    if (!data) return []
    // Exclude internal _pending node
    return Object.values(data).filter(c => c.cid)
  })())
}

/**
 * Update last sync timestamp.
 * @param {string} uid
 * @param {string} cid
 * @returns {AsyncResult}
 */
export function updateSyncTimestamp(uid, cid) {
  return AsyncResult.from((async () => {
    return await dbUpdate(dbRef(`/calendar_connections/${uid}/${cid}`), {
      lastSync: new Date().toISOString(),
    }).unwrapOrThrow()
  })())
}

/**
 * Refresh OAuth tokens (called by Cloud Function).
 * Client calls Cloud Function endpoint; server handles token refresh.
 *
 * @param {string} uid
 * @param {string} cid
 * @returns {AsyncResult}
 */
export function refreshTokens(uid, cid) {
  return AsyncResult.from((async () => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const resp = await fetch('/api/oauth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, cid }),
        signal: controller.signal,
      })
      if (!resp.ok) throw new Error('Token refresh failed')
      return true
    } finally {
      clearTimeout(timer)
    }
  })())
}

/**
 * Merge external calendar busy intervals into host availability.
 * Marks overlapping slots as 'external_busy' so they are excluded from booking.
 *
 * @param {string} uid — host user ID
 * @param {string} cid — calendar connection ID
 * @param {Array} events — array of { start: ISO string, end: ISO string } from external calendar
 * @returns {AsyncResult}
 */
export function syncAvailability(uid, cid, events) {
  return AsyncResult.from((async () => {
    if (!Array.isArray(events)) throw new Error('events must be an array')

    const processed = []
    for (const ev of events) {
      const start = new Date(ev.start)
      const end = new Date(ev.end)
      if (isNaN(start.getTime()) || isNaN(end.getTime())) continue

      // Mark each date in the event range with external_busy
      const cursor = new Date(start)
      cursor.setUTCHours(0, 0, 0, 0)
      const endDay = new Date(end)
      endDay.setUTCHours(0, 0, 0, 0)

      while (cursor <= endDay) {
        const dateStr = cursor.toISOString().slice(0, 10)
        // Mark all slots on this date as potentially busy
        await markSlotExternalBusy(uid, dateStr, 'external_busy').unwrapOrThrow()
        processed.push(dateStr)
        cursor.setUTCDate(cursor.getUTCDate() + 1)
      }
    }

    // Store sync metadata
    await dbWrite(dbRef(`/calendar_synced_slots/${uid}/${cid}`), {
      lastSync: new Date().toISOString(),
      eventCount: events.length,
      datesMarked: processed.length,
    }).unwrapOrThrow()

    await updateSyncTimestamp(uid, cid).unwrapOrThrow()
    return { datesMarked: processed.length, eventCount: events.length }
  })())
}

/**
 * Push a confirmed booking back to external calendars so it appears as a calendar event.
 * Called after successful booking.
 *
 * @param {string} uid — host user ID
 * @param {Object} booking — { bid, date, slotId, formData: { name, email }, eventType }
 * @returns {AsyncResult}
 */
export function pushBookingToExternalCalendars(uid, booking) {
  return AsyncResult.from((async () => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const resp = await fetch('/api/calendar/push-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, booking }),
        signal: controller.signal,
      })
      if (!resp.ok) {
        // Log failure but don't block — booking already confirmed
        console.error('[calendar] push-booking failed:', resp.status)
        return false
      }
      return true
    } catch (e) {
      console.error('[calendar] push-booking error:', e)
      return false
    } finally {
      clearTimeout(timer)
    }
  })())
}
