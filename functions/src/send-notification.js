/**
 * send-notification.js — Email/SMS notification dispatcher.
 *
 * Trigger: HTTP POST /api/notifications/send
 * Constructs and sends email via SendGrid/Mailgun.
 * Masks PHI (patient names → "Client ID #xxx").
 * Rate limited: 30/min per host.
 * Logs delivery status to /notifications/{nid}.
 */

import { onRequest } from 'firebase-functions/v2/https'
import { getDatabase } from 'firebase-admin/database'
import { initializeApp } from 'firebase-admin/app'

initializeApp()

const RATE_LIMIT_WINDOW_MS = 60000
const RATE_LIMIT_MAX = 30

// In-memory rate limit tracking (resets on cold start; use Firestore for production)
const rateLimitMap = new Map()

export const sendnotification = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { type, bookingId, hostId, recipient, data } = req.body || {}

    if (!type || !hostId) {
      return res.status(400).json({ error: 'Missing required fields: type, hostId' })
    }

    // Rate limit check
    const now = Date.now()
    const windowStart = now - RATE_LIMIT_WINDOW_MS
    let hostCalls = rateLimitMap.get(hostId) || []
    hostCalls = hostCalls.filter(t => t > windowStart)

    if (hostCalls.length >= RATE_LIMIT_MAX) {
      return res.status(429).json({ error: 'Rate limit exceeded. Max 30 notifications per minute.' })
    }

    hostCalls.push(now)
    rateLimitMap.set(hostId, hostCalls)

    try {
      const result = await dispatchNotification({ type, bookingId, hostId, recipient, data })
      return res.status(200).json(result)
    } catch (e) {
      console.error('[notification] dispatch failed:', e.message)
      return res.status(500).json({ error: 'Notification dispatch failed', details: e.message })
    }
  }
)

/**
 * Dispatch notification via configured email provider.
 */
async function dispatchNotification({ type, bookingId, hostId, recipient, data }) {
  const db = getDatabase()

  // Build email content
  const maskedData = maskPHI(data || {})
  const subject = getSubject(type, maskedData)
  const body = getBody(type, maskedData)

  // Send via SendGrid (or Mailgun) — config from env
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) {
    console.warn('[notification] SENDGRID_API_KEY not set — logging only')
    return logNotification(db, { type, bookingId, hostId, recipient, subject, status: 'logged_only' })
  }

  const emailPayload = {
    personalizations: [{ to: [{ email: recipient }] }],
    from: { email: process.env.FROM_EMAIL || 'noreply@calendly-v2.com', name: 'Calendly v2' },
    subject,
    content: [{ type: 'text/plain', value: body }],
  }

  const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailPayload),
  })

  const status = resp.ok ? 'delivered' : 'failed'

  return logNotification(db, {
    type,
    bookingId,
    hostId,
    recipient,
    subject,
    status,
    providerResponse: resp.status,
  })
}

/**
 * Mask PHI in notification data.
 */
function maskPHI(data) {
  const masked = { ...data }
  if (masked.formData) {
    masked.formData = { ...masked.formData }
    if (masked.formData.name) {
      masked.formData.name = `Client ID #${(data.bookingId || 'unknown').slice(-6)}`
    }
    delete masked.formData.phone
    delete masked.formData.notes
  }
  return masked
}

function getSubject(type, data) {
  const bookingInfo = data.date ? `${data.date}` : 'Booking'
  switch (type) {
    case 'booking_confirmation': return `Confirmed: ${bookingInfo}`
    case 'booking_cancellation': return `Cancelled: ${bookingInfo}`
    case 'booking_reminder': return `Reminder: ${bookingInfo}`
    case 'timer_warning': return `Timer Warning: ${data.message || 'Approaching limit'}`
    default: return `Calendly: ${bookingInfo}`
  }
}

function getBody(type, data) {
  switch (type) {
    case 'booking_confirmation':
      return `Your booking is confirmed.\n\nDate: ${data.date || 'N/A'}\nTime: ${data.slotId || 'N/A'}\n\nNeed to reschedule? Contact your host.`
    case 'booking_cancellation':
      return `Your booking has been cancelled.\n\nDate: ${data.date || 'N/A'}\n\nTo rebook, visit your host's booking page.`
    case 'booking_reminder':
      return `Reminder: You have a meeting scheduled.\n\nDate: ${data.date || 'N/A'}\nTime: ${data.slotId || 'N/A'}`
    case 'timer_warning':
      return data.message || 'Your timer is approaching the limit.'
    default:
      return `Notification from Calendly v2`
  }
}

async function logNotification(db, entry) {
  const nid = 'not_' + Date.now().toString(36)
  const record = {
    nid,
    ...entry,
    createdAt: new Date().toISOString(),
  }
  await db.ref(`/notifications/${nid}`).set(record)
  console.log(`[notification] ${nid} → ${entry.status}`)
  return record
}
