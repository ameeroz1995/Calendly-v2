/**
 * dispatch-webhook.js — Webhook dispatcher.
 *
 * Trigger: onValueWritten('/bookings/{bookingId}')
 * Detects booking create/update. Reads host's webhook subscriptions.
 * Dispatches POST to each subscriber with HMAC-SHA256 signature.
 * 3 retries with exponential backoff (5s/30s/300s).
 * Dead letter queue to /webhook_failures/{sid}.
 */

import { onValueWritten } from 'firebase-functions/v2/database'
import { getDatabase } from 'firebase-admin/database'
import { initializeApp } from 'firebase-admin/app'
import { createHmac } from 'node:crypto'

initializeApp()

const RETRY_SCHEDULE = [5000, 30000, 300000] // 5s, 30s, 5min

export const dispatchwebhook = onValueWritten(
  { ref: '/bookings/{bookingId}', region: 'us-central1' },
  async (event) => {
    const bookingId = event.params.bookingId
    const after = event.data.after.val()

    // Only dispatch for new/changed bookings, not deletions
    if (!after) {
      console.log(`[webhook] booking ${bookingId} deleted — skipping dispatch`)
      return
    }

    const hostId = after.hostId
    if (!hostId) {
      console.warn(`[webhook] booking ${bookingId} has no hostId`)
      return
    }

    const db = getDatabase()
    const subsSnapshot = await db.ref(`/webhook_subscriptions/${hostId}`).get()
    const subscriptions = subsSnapshot.val()

    if (!subscriptions) {
      console.log(`[webhook] no subscriptions for host ${hostId}`)
      return
    }

    const eventType = after.status === 'cancelled' ? 'invitee.canceled' : 'invitee.created'
    const payload = JSON.stringify({
      event: eventType,
      timestamp: new Date().toISOString(),
      data: {
        booking: {
          bid: after.bid,
          hostId: after.hostId,
          inviteeId: after.inviteeId,
          eventTypeId: after.eventTypeId,
          date: after.date,
          status: after.status,
          formData: after.formData || {},
          createdAt: after.createdAt,
        },
      },
    })

    const dispatchPromises = []

    for (const [sid, sub] of Object.entries(subscriptions)) {
      if (!sub || !sub.active) continue
      if (!sub.events || !sub.events.includes(eventType)) continue

      dispatchPromises.push(
        dispatchWithRetry(sub.url, payload, sub.secret, sid, hostId, sub.deliveryCount || 0, db)
      )
    }

    await Promise.allSettled(dispatchPromises)
    console.log(`[webhook] dispatched ${dispatchPromises.length} webhooks for booking ${bookingId}`)
  }
)

/**
 * Dispatch a webhook with retry and dead letter queue.
 *
 * @param {string} url
 * @param {string} payload - JSON string
 * @param {string} secret - HMAC secret
 * @param {string} sid - subscription ID
 * @param {string} hostId - host UID (threaded from caller to avoid O(n) scan)
 * @param {number} currentDeliveryCount - current delivery count from subscription
 * @param {object} db - Firebase database instance
 */
async function dispatchWithRetry(url, payload, secret, sid, hostId, currentDeliveryCount, db) {
  const signature = createHmac('sha256', secret).update(payload).digest('hex')

  for (let attempt = 0; attempt <= RETRY_SCHEDULE.length; attempt++) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Calendly-Signature': signature,
        },
        body: payload,
        signal: AbortSignal.timeout(10000),
      })

      // Update delivery stats — hostId threaded directly, no O(n) scan
      await db.ref(`/webhook_subscriptions/${hostId}/${sid}`).update({
        lastDelivery: new Date().toISOString(),
        lastResponseCode: resp.status,
        deliveryCount: currentDeliveryCount + 1,
      })

      console.log(`[webhook] ${sid} → ${resp.status}`)
      return
    } catch (e) {
      console.error(`[webhook] ${sid} attempt ${attempt + 1} failed:`, e.message)
      if (attempt < RETRY_SCHEDULE.length) {
        await sleep(RETRY_SCHEDULE[attempt])
      }
    }
  }

  // Dead letter queue
  console.error(`[webhook] ${sid} exhausted retries — sending to DLQ`)
  await db.ref(`/webhook_failures/${sid}`).push({
    sid,
    url,
    payload,
    secret,
    failedAt: new Date().toISOString(),
    error: 'Exhausted all retry attempts',
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
