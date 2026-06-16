/**
 * webhook.service.js — Webhook subscription management.
 *
 * Subscribe/unsubscribe webhooks. Test dispatch. HMAC signing secret generation.
 */

import { AsyncResult } from '../utils/Result.js'
import { dbRef, dbRead, dbWrite, dbUpdate, dbRemove } from '../db.js'
import { generateRandomHex } from '../utils/crypto.js'
import { validateWebhookUrl } from '../utils/validators.js'

/**
 * Subscribe a new webhook.
 * @param {string} uid — host UID
 * @param {Object} data — { url, events:['invitee.created','invitee.canceled','routing.submitted'] }
 * @returns {AsyncResult}
 */
export function subscribeWebhook(uid, data) {
  return AsyncResult.from((async () => {
    const validation = validateWebhookUrl(data.url)
    if (!validation.valid) throw new Error(validation.errors[0]?.message || 'Invalid webhook URL')

    const sid = 'wh_' + generateRandomHex(8)
    const secret = 'whsec_' + generateRandomHex(24)
    const now = new Date().toISOString()
    await dbWrite(dbRef(`/webhook_subscriptions/${uid}/${sid}`), {
      sid,
      uid,
      url: data.url,
      events: data.events || ['invitee.created'],
      secret,
      active: true,
      lastDelivery: null,
      deliveryCount: 0,
      createdAt: now,
      updatedAt: now,
    }).unwrapOrThrow()

    return { sid, secret }
  })())
}

/**
 * Unsubscribe a webhook.
 * @param {string} uid
 * @param {string} sid
 * @returns {AsyncResult}
 */
export function unsubscribeWebhook(uid, sid) {
  return AsyncResult.from((async () => {
    await dbRemove(dbRef(`/webhook_subscriptions/${uid}/${sid}`)).unwrapOrThrow()
    return true
  })())
}

/**
 * List webhook subscriptions for a user.
 * @param {string} uid
 * @returns {AsyncResult}
 */
export function listSubscriptions(uid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/webhook_subscriptions/${uid}`)).unwrap()
    if (err) throw err
    if (!data) return []
    return Object.values(data).filter(s => s.sid) // exclude potential _pending nodes
  })())
}

/**
 * Test a webhook by POSTing a sample payload.
 * @param {string} uid
 * @param {string} sid
 * @returns {AsyncResult}
 */
export function testWebhook(uid, sid) {
  return AsyncResult.from((async () => {
    const [subs, listErr] = await listSubscriptions(uid).unwrap()
    if (listErr) throw listErr
    const sub = (subs || []).find(s => s.sid === sid)
    if (!sub) throw new Error('Webhook subscription not found')

    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook from Calendly v2' },
    }

    const signature = await createHmacSignature(JSON.stringify(testPayload), sub.secret)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    try {
      const resp = await fetch(sub.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Calendly-Signature': signature,
        },
        body: JSON.stringify(testPayload),
        signal: controller.signal,
      })

      // Update delivery stats
      await dbUpdate(dbRef(`/webhook_subscriptions/${uid}/${sid}`), {
        lastDelivery: new Date().toISOString(),
        deliveryCount: (sub.deliveryCount || 0) + 1,
        lastResponseCode: resp.status,
      }).unwrapOrThrow()

      return {
        status: resp.status,
        ok: resp.ok,
        body: await resp.text().catch(() => ''),
      }
    } finally {
      clearTimeout(timer)
    }
  })())
}

/**
 * Create an HMAC-SHA256 signature for a webhook payload.
 * @param {string} payload — JSON string
 * @param {string} secret — signing secret
 * @returns {Promise<string>} hex-encoded signature
 */
async function createHmacSignature(payload, secret) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate a webhook signing secret.
 * @returns {string} prefixed secret string
 */
export function generateSigningSecret() {
  return 'whsec_' + generateRandomHex(24)
}
