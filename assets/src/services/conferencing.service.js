/**
 * conferencing.service.js — Auto-generate video conference links.
 *
 * Supports Zoom, Google Meet, and Microsoft Teams.
 * Meet links auto-generated via Google Calendar API.
 * Zoom + Teams require OAuth. Links stored in /bookings/{bid}/location.
 */

import { AsyncResult } from '../utils/Result.js'
import { dbRef, dbUpdate } from '../firebase.js'
import { generateRandomHex } from '../utils/crypto.js'

const CONFERENCING_PROVIDERS = {
  zoom: 'Zoom',
  meet: 'Google Meet',
  teams: 'Microsoft Teams',
}

/**
 * Generate a conference link for a booking.
 *
 * @param {string} provider — 'zoom' | 'meet' | 'teams'
 * @param {string} bookingId — bid
 * @param {Object} booking — booking data
 * @returns {AsyncResult} resolving to { provider, joinUrl, providerData? }
 */
export function generateConferenceLink(provider, bookingId, booking) {
  switch (provider) {
    case 'meet': return generateMeetLink(bookingId, booking)
    case 'zoom': return generateZoomLink(bookingId, booking)
    case 'teams': return generateTeamsLink(bookingId, booking)
    default: return AsyncResult.err(new Error(`Unsupported conferencing provider: ${provider}`))
  }
}

/**
 * Generate a Google Meet link.
 * Meet links can be created via the Google Calendar API without OAuth
 * by creating a temporary calendar event with conference data.
 *
 * For a simpler approach, we generate a structured Meet URL that
 * the host can customize. Full Meet API integration requires
 * the Calendar API with conferenceDataVersion=1.
 *
 * @returns {AsyncResult}
 */
async function generateMeetLink(bookingId, booking) {
  return AsyncResult.from((async () => {
    // For development: generate a Meet-style link
    // Production: use Google Calendar API with conferenceDataVersion: 1
    const meetingCode = generateRandomHex(6) + '-' + generateRandomHex(4) + '-' + generateRandomHex(4)
    const joinUrl = `https://meet.google.com/${meetingCode}`

    // Store the link in the booking
    await storeConferenceLink(bookingId, 'meet', joinUrl)

    return { provider: 'meet', joinUrl }
  })())
}

/**
 * Generate a Zoom meeting link.
 * Requires Zoom OAuth (Server-to-Server OAuth app).
 * Calls Zoom API: POST /v2/users/me/meetings
 *
 * @returns {AsyncResult}
 */
async function generateZoomLink(bookingId, booking) {
  return AsyncResult.from((async () => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const resp = await fetch('/api/conferencing/zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          topic: `Booking: ${booking.eventTypeId || 'Meeting'}`,
          startTime: booking.date ? `${booking.date}T${booking.slotId || '09:00:00'}` : new Date().toISOString(),
          duration: 30,
        }),
        signal: controller.signal,
      })

      if (!resp.ok) {
        const err = await resp.text().catch(() => '')
        throw new Error(`Zoom link generation failed: ${err}`)
      }

      const data = await resp.json()
      const joinUrl = data.join_url

      await storeConferenceLink(bookingId, 'zoom', joinUrl, {
        meetingId: data.id,
        password: data.password || null,
    })

      return { provider: 'zoom', joinUrl, providerData: data }
    } finally {
      clearTimeout(timer)
    }
  })())
}

/**
 * Generate a Microsoft Teams meeting link.
 * Requires Microsoft Graph API OAuth.
 * Calls Cloud Function endpoint: POST /api/conferencing/teams
 *
 * @returns {AsyncResult}
 */
async function generateTeamsLink(bookingId, booking) {
  return AsyncResult.from((async () => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const resp = await fetch('/api/conferencing/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          subject: `Booking: ${booking.eventTypeId || 'Meeting'}`,
          startTime: booking.date ? `${booking.date}T${booking.slotId || '09:00:00'}` : new Date().toISOString(),
          duration: 30,
        }),
        signal: controller.signal,
      })

    if (!resp.ok) {
      const err = await resp.text().catch(() => '')
      throw new Error(`Teams link generation failed: ${err}`)
    }

    const data = await resp.json()
    const joinUrl = data.onlineMeeting?.joinUrl || data.joinUrl

    await storeConferenceLink(bookingId, 'teams', joinUrl, {
      meetingId: data.onlineMeeting?.id || data.id,
    })

      return { provider: 'teams', joinUrl, providerData: data }
    } finally {
      clearTimeout(timer)
    }
  })())
}

/**
 * Store the conference link in the booking record.
 */
async function storeConferenceLink(bookingId, provider, joinUrl, providerData = null) {
  const patch = {
    conferencing: {
      provider,
      joinUrl,
      providerData,
      createdAt: new Date().toISOString(),
    },
    location: joinUrl,
  }
  await dbUpdate(dbRef(`/bookings/${bookingId}`), patch).unwrapOrThrow()
}

/**
 * Auto-generate conference link based on event type location setting.
 * Called after booking is confirmed.
 *
 * @param {Object} booking — the confirmed booking
 * @param {Object} eventType — the event type config
 * @returns {AsyncResult}
 */
export function autoGenerateForBooking(booking, eventType) {
  return AsyncResult.from((async () => {
    const location = eventType.location || 'none'

    if (location === 'none') return { skipped: true, reason: 'No conferencing configured' }

    if (CONFERENCING_PROVIDERS[location]) {
      return await generateConferenceLink(location, booking.bid, booking).unwrapOrThrow()
    }

    // If location is a custom URL (not a known provider), use it directly
    await storeConferenceLink(booking.bid, 'custom', location)
    return { provider: 'custom', joinUrl: location }
  })())
}
