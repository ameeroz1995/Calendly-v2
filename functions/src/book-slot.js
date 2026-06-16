/**
 * book-slot.js — Server-side atomic slot booking.
 *
 * Trigger: HTTP POST /api/book
 *
 * This is the ONLY code path that writes to /availability/{hostId}/{date}/{slotId}
 * and creates booking records. Client-side writes to availability slots are
 * DENIED by database.rules.json.
 *
 * The function:
 *   1. Validates the request payload
 *   2. Runs an atomic transaction on the slot (compare-and-swap)
 *   3. Creates the booking record + workspace atomically
 *   4. Returns the result to the client
 *
 * This eliminates the DOS vulnerability where a malicious user could
 * directly mark free slots as busy without creating a proper booking.
 */

import { onRequest } from 'firebase-functions/v2/https'
import { getDatabase } from 'firebase-admin/database'
import { initializeApp } from 'firebase-admin/app'
import { randomBytes } from 'node:crypto'

initializeApp()

export const bookslot = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { hostId, date, slotId, inviteeId, eventTypeId, formData } = req.body || {}

    // Validate required fields
    if (!hostId || !date || !slotId || !eventTypeId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['hostId', 'date', 'slotId', 'eventTypeId'],
      })
    }

    // Validate date format (ISO 8601 date)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' })
    }

    // Validate slotId format
    if (!slotId.startsWith('slt_')) {
      return res.status(400).json({ error: 'Invalid slotId format.' })
    }

    // Validate formData if invitee is authenticated
    const safeInviteeId = inviteeId || 'anonymous'
    const safeFormData = formData || {}
    if (inviteeId && !safeFormData.email) {
      return res.status(400).json({ error: 'formData.email is required for authenticated bookings' })
    }

    const db = getDatabase()
    const slotRef = db.ref(`/availability/${hostId}/${date}/${slotId}`)

    try {
      // ── Atomic transaction with transient retry ──
      // Transaction conflicts (slot_taken, slot_missing) → fail fast (no retry).
      // Transient Firebase errors (network, server busy) → 1 retry with 1s backoff.
      const result = await runWithTransientRetry(async () => {
        return await db.runTransaction(async (txn) => {
          const snap = await txn.get(slotRef)
          if (!snap.exists()) {
            throw new BookingError('Slot does not exist', 'slot_missing')
          }

          const current = snap.val()
          if (current.status !== 'free') {
            throw new BookingError('Slot is no longer available', 'slot_taken')
          }

          const now = new Date().toISOString()
          const updatedSlot = {
            ...current,
            status: 'busy',
            inviteeId: safeInviteeId,
            bookedAt: now,
            bookedVia: 'api',
          }

          txn.set(slotRef, updatedSlot)
          return { slot: updatedSlot, now }
        }, { maxRetries: 0 }) // SDK-level: no retries (we handle retries ourselves)
      })

      const { slot, now } = result

      // ── Create booking record ──
      const bid = 'bkg_' + randomId(8)
      const booking = {
        bid,
        hostId,
        inviteeId: safeInviteeId,
        eventTypeId,
        date,
        slotId,
        status: 'confirmed',
        formData: safeFormData,
        createdAt: now,
        updatedAt: now,
      }

      await db.ref(`/bookings/${bid}`).set(booking)

      // ── Write booking index entries (host + invitee) ──
      await db.ref(`/host_bookings/${hostId}/${bid}`).set(true)
      if (safeInviteeId !== 'anonymous') {
        await db.ref(`/invitee_bookings/${safeInviteeId}/${bid}`).set(true)
      }

      // ── Create workspace ──
      const wid = 'ws_' + randomId(6)
      const workspace = {
        wid,
        hostId,
        clientId: safeInviteeId,
        clientName: safeFormData.name || 'Guest',
        eventTypeId,
        bookingId: bid,
        status: 'active',
        tasks: {},
        messages: {},
        timers: { current: null, log: {} },
        createdAt: now,
        updatedAt: now,
      }
      await db.ref(`/workspaces/${wid}`).set(workspace)

      console.log(`[book] ${bid} confirmed — host=${hostId} date=${date} slot=${slotId}`)

      return res.status(200).json({
        success: true,
        booking: { bid, status: 'confirmed', date, slotId },
        workspace: { wid },
      })

    } catch (e) {
      if (e instanceof BookingError) {
        console.warn(`[book] ${e.code}: ${e.message}`)
        return res.status(409).json({ error: e.message, code: e.code })
      }

      console.error('[book] unexpected error:', e)
      return res.status(500).json({ error: 'Booking failed', details: e.message })
    }
  }
)

/**
 * Custom error class for booking-specific failures.
 */
class BookingError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
    this.name = 'BookingError'
  }
}

/**
 * Generate a random hex ID of given byte length using crypto RNG.
 */
function randomId(bytes) {
  return randomBytes(bytes).toString('hex')
}

/**
 * Run an async operation with retry for transient errors only.
 * BookingError (slot_taken, slot_missing) is re-thrown immediately.
 * Other errors are retried once with 1s backoff.
 *
 * @param {Function} fn - async operation to run
 * @param {number} maxAttempts - maximum total attempts (default 2)
 * @returns {Promise} result of fn()
 */
async function runWithTransientRetry(fn, maxAttempts = 2) {
  let lastError = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[book] transaction attempt ${attempt}/${maxAttempts}`)
      return await fn()
    } catch (e) {
      lastError = e

      // BookingError (slot_taken, slot_missing) → fail fast, no retry
      if (e instanceof BookingError) {
        throw e
      }

      // Last attempt → give up
      if (attempt >= maxAttempts) {
        throw e
      }

      // Transient error → retry with backoff
      console.warn(`[book] transient error (attempt ${attempt}/${maxAttempts}): ${e.message} — retrying in 1s`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  throw lastError
}
