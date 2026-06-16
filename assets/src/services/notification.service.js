/**
 * notification.service.js — Booking notifications.
 *
 * All notification sends go through Cloud Function HTTP endpoint.
 * PHI masking replaces patient names with "Client ID #xxx".
 */

import { AsyncResult } from '../utils/Result.js'
import { dbRef, dbRead, dbWrite } from '../firebase.js'

const NOTIFY_ENDPOINT = '/api/notifications/send'
const DEFAULT_PREFS = {
  emailBookings: true,
  emailCancellations: true,
  emailReminders: true,
  smsBookings: false,
  smsReminders: false,
}

/**
 * Send a booking confirmation notification.
 * @param {Object} booking — { bid, hostId, inviteeId, formData, date, ... }
 * @returns {AsyncResult}
 */
export function sendBookingConfirmation(booking) {
  return sendNotification({
    type: 'booking_confirmation',
    bookingId: booking.bid,
    hostId: booking.hostId,
    recipient: booking.formData?.email || '',
    data: maskPHIForNotification(booking),
  })
}

/**
 * Send a cancellation notice.
 * @param {Object} booking
 * @returns {AsyncResult}
 */
export function sendCancellationNotice(booking) {
  return sendNotification({
    type: 'booking_cancellation',
    bookingId: booking.bid,
    hostId: booking.hostId,
    recipient: booking.formData?.email || '',
    data: maskPHIForNotification(booking),
  })
}

/**
 * Send a reminder notification.
 * @param {Object} booking
 * @returns {AsyncResult}
 */
export function sendReminder(booking) {
  return sendNotification({
    type: 'booking_reminder',
    bookingId: booking.bid,
    hostId: booking.hostId,
    recipient: booking.formData?.email || '',
    data: maskPHIForNotification(booking),
  })
}

/**
 * Mask PHI fields in notification data.
 * Replaces patient name with "Client ID #xxx".
 *
 * @param {Object} booking
 * @returns {Object} masked booking data
 */
export function maskPHIForNotification(booking) {
  const masked = { ...booking }
  if (masked.formData) {
    masked.formData = { ...masked.formData }
    if (masked.formData.name) {
      masked.formData.name = `Client ID #${booking.bid?.slice(-6) || 'unknown'}`
    }
    // Strip phone and notes from notifications
    delete masked.formData.phone
    delete masked.formData.notes
  }
  return masked
}

/**
 * Low-level send via Cloud Function.
 * @param {Object} payload — { type, bookingId, hostId, recipient, data }
 * @returns {AsyncResult}
 */
function sendNotification(payload) {
  return AsyncResult.from((async () => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const resp = await fetch(NOTIFY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      if (!resp.ok) {
        const errBody = await resp.text().catch(() => '')
        throw new Error(`Notification failed (${resp.status}): ${errBody}`)
      }
      return await resp.json()
    } finally {
      clearTimeout(timer)
    }
  })())
}

/**
 * Get notification preferences for a user.
 * Returns defaults if none are set.
 * @param {string} uid
 * @returns {AsyncResult}
 */
export function getNotificationPrefs(uid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/notification_prefs/${uid}`)).unwrap()
    if (err) throw err
    return data ? { ...DEFAULT_PREFS, ...data } : { ...DEFAULT_PREFS }
  })())
}

/**
 * Set notification preferences for a user.
 * Merges with existing preferences.
 * @param {string} uid
 * @param {Object} prefs — partial prefs to update
 * @returns {AsyncResult}
 */
export function setNotificationPrefs(uid, prefs) {
  return AsyncResult.from((async () => {
    return await dbWrite(dbRef(`/notification_prefs/${uid}`), {
      ...DEFAULT_PREFS,
      ...prefs,
      updatedAt: new Date().toISOString(),
    }).unwrapOrThrow()
  })())
}
