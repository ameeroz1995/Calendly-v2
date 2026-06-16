/**
 * booking.service.js — Slot booking via Cloud Function.
 *
 * Client NEVER writes directly to /availability/ — that's blocked by
 * database.rules.json (only host UID can write to own slots).
 * All bookings go through the server-side Cloud Function which:
 *   1. Uses Firebase Admin SDK (bypasses rules)
 *   2. Runs atomic compare-and-swap transaction
 *   3. Creates booking + workspace records atomically
 *   4. Splits PHI from non-PHI data
 *
 * This eliminates the DOS vulnerability where a malicious authenticated user
 * could directly mark free slots as busy without creating a proper booking.
 */

import { AsyncResult } from '../utils/Result.js'
import { dbRef, dbRead, dbUpdate, dbWrite, dbRemove } from '../db.js'
import { markSlotFree } from './availability.service.js'
import { getEventType } from './event-type.service.js'

const BOOK_API = '/api/book'
const FETCH_TIMEOUT_MS = 15000
const RETRY_BACKOFF_MS = 1000

/**
 * Book a slot via the server-side Cloud Function.
 *
 * @param {string} hostId
 * @param {string} date — ISO date YYYY-MM-DD
 * @param {string} slotId
 * @param {string} inviteeId — null for unauthenticated bookings
 * @param {Object} bookingData — { eventTypeId, formData: { name, email, ... }, requiresPhi }
 * @returns {AsyncResult}
 */
export function bookSlot(hostId, date, slotId, inviteeId, bookingData) {
  return AsyncResult.from((async () => {
    const { eventTypeId, formData, requiresPhi } = bookingData

    // Pre-submit check: verify event type exists and is active
    if (eventTypeId) {
      const [et, etErr] = await getEventType(hostId, eventTypeId).unwrap()
      if (etErr) {
        console.error('[booking] pre-submit event type check failed:', etErr)
        throw new Error('Unable to verify event type — please try again', { cause: etErr })
      }
      if (!et) throw new Error('event_deleted')
      if (et.active === false) throw new Error('event_deleted')
    }

    // Call Cloud Function with 1 retry for transient errors
    const result = await callBookApi({ hostId, date, slotId, inviteeId, eventTypeId, formData })
    const { booking, workspace } = result

    // PHI handling — CF creates booking + slot write.
    // Client handles PHI split if the event type requires it.
    if (requiresPhi && formData) {
      const phiKeys = ['name', 'email', 'phone', 'notes']
      const phiFields = {}
      for (const k of phiKeys) {
        if (formData[k] !== undefined && formData[k] !== null && formData[k] !== '') {
          phiFields[k] = formData[k]
        }
      }
      if (Object.keys(phiFields).length > 0) {
        await dbWrite(dbRef(`/secure_phi/${booking.bid}`), {
          ...phiFields,
          bid: booking.bid,
          createdAt: new Date().toISOString(),
        }).unwrapOrThrow()
      }
    }

    return { booking, workspace }
  })())
}

/**
 * Call the booking Cloud Function with retry for transient errors.
 * Does NOT retry on 4xx (validation) or 409 (slot_taken/slot_missing).
 * Retries once on 5xx, network errors, or AbortError.
 */
async function callBookApi(payload) {
  const maxAttempts = 2
  let lastError = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      const resp = await fetch(BOOK_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: payload.hostId,
          date: payload.date,
          slotId: payload.slotId,
          inviteeId: payload.inviteeId || null,
          eventTypeId: payload.eventTypeId,
          formData: payload.formData || {},
        }),
        signal: controller.signal,
      })

      const body = await resp.json().catch(() => ({}))

      if (!resp.ok) {
        // Map Cloud Function error codes to user-facing messages
        const code = body.code
        const isConflict = code === 'slot_taken' || code === 'slot_missing' || resp.status === 409
        const isClientError = resp.status >= 400 && resp.status < 500

        if (code === 'slot_taken') {
          throw new Error('This time slot was just booked by someone else. Please choose another.')
        }
        if (code === 'slot_missing') {
          throw new Error('This time slot is no longer available.')
        }

        // 4xx and 409 errors → fail immediately, no retry
        if (isConflict || isClientError) {
          throw new Error(body.error || `Booking failed (${resp.status})`)
        }

        // 5xx → may retry
        throw new Error(body.error || `Booking failed (${resp.status})`)
      }

      // Success
      return { booking: body.booking, workspace: body.workspace }

    } catch (e) {
      lastError = e
      clearTimeout(timer)

      // Never retry validation/slot-taken errors
      if (e.message.includes('slot was just booked') ||
          e.message.includes('no longer available') ||
          e.message.includes('event_deleted') ||
          e.message.includes('verify event type')) {
        throw e
      }

      // Last attempt → give up
      if (attempt >= maxAttempts) {
        throw e
      }

      // Transient error → retry
      const isTransient = e.name === 'AbortError' ||
        e.message.includes('Failed to fetch') ||
        e.message.includes('NetworkError') ||
        e.message.includes('500') ||
        e.message.includes('502') ||
        e.message.includes('503')

      if (isTransient) {
        console.warn(`[booking] transient error (attempt ${attempt}/${maxAttempts}), retrying in ${RETRY_BACKOFF_MS}ms:`, e.message)
        await new Promise(resolve => setTimeout(resolve, RETRY_BACKOFF_MS))
        continue
      }

      throw e
    }
  }

  throw lastError
}

/**
 * Cancel a booking and free the slot.
 * @param {string} bid
 * @returns {AsyncResult}
 */
export function cancelBooking(bid) {
  return AsyncResult.from((async () => {
    const [booking, readErr] = await getBooking(bid).unwrap()
    if (readErr) throw readErr
    if (!booking) throw new Error('Booking not found')

    await dbUpdate(dbRef(`/bookings/${bid}`), {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    }).unwrapOrThrow()

    // Clean up booking index entries
    await dbRemove(dbRef(`/host_bookings/${booking.hostId}/${bid}`)).unwrap()
    if (booking.inviteeId && booking.inviteeId !== 'anonymous') {
      await dbRemove(dbRef(`/invitee_bookings/${booking.inviteeId}/${bid}`)).unwrap()
    }

    await markSlotFree(booking.hostId, booking.date, booking.slotId).unwrapOrThrow()
    return true
  })())
}

/**
 * Get a booking by ID.
 * @param {string} bid
 * @returns {AsyncResult}
 */
export function getBooking(bid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/bookings/${bid}`)).unwrap()
    if (err) throw err
    return data
  })())
}

/**
 * List bookings for a host. Uses host-bookings index for O(1) lookup.
 * @param {string} hostId
 * @returns {AsyncResult}
 */
export function listBookingsForHost(hostId) {
  return AsyncResult.from((async () => {
    // Read index: /host_bookings/{hostId} → { bid: true, ... }
    const [index, indexErr] = await dbRead(dbRef(`/host_bookings/${hostId}`)).unwrap()
    if (indexErr) throw indexErr
    if (!index) return []

    const bookingIds = Object.keys(index)
    if (bookingIds.length === 0) return []

    // Batch-read actual bookings
    const bookings = []
    for (const bid of bookingIds) {
      const [b, err] = await dbRead(dbRef(`/bookings/${bid}`)).unwrap()
      if (err || !b) continue
      bookings.push(b)
    }
    return bookings
  })())
}

/**
 * List bookings for an invitee. Uses invitee-bookings index for O(1) lookup.
 * @param {string} inviteeId
 * @returns {AsyncResult}
 */
export function listBookingsForInvitee(inviteeId) {
  return AsyncResult.from((async () => {
    // Read index: /invitee_bookings/{inviteeId} → { bid: true, ... }
    const [index, indexErr] = await dbRead(dbRef(`/invitee_bookings/${inviteeId}`)).unwrap()
    if (indexErr) throw indexErr
    if (!index) return []

    const bookingIds = Object.keys(index)
    if (bookingIds.length === 0) return []

    // Batch-read actual bookings
    const bookings = []
    for (const bid of bookingIds) {
      const [b, err] = await dbRead(dbRef(`/bookings/${bid}`)).unwrap()
      if (err || !b) continue
      bookings.push(b)
    }
    return bookings
  })())
}
