/**
 * Smoke tests for dispatch-webhook.js
 *
 * Run: node --experimental-test-module-mocks --test functions/src/__tests__/dispatch-webhook.smoke.test.js
 */

import { describe, it, mock, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

// ── Mutable mock state ──
let subscriptionsVal = null
let fetchImpl = () => Promise.resolve({ status: 200 })
let refGetCalls = 0
let refUpdateCalls = 0
let refPushCalls = 0

// ── Mock firebase-admin/app ──
mock.module('firebase-admin/app', {
  namedExports: { initializeApp: () => {} },
})

// ── Mock firebase-admin/database ──
mock.module('firebase-admin/database', {
  namedExports: {
    getDatabase: () => ({
      ref: () => ({
        get: () => {
          refGetCalls++
          return Promise.resolve({ val: () => subscriptionsVal })
        },
        update: () => {
          refUpdateCalls++
          return Promise.resolve()
        },
        push: () => {
          refPushCalls++
          return Promise.resolve({ key: 'mock_fail_id' })
        },
      }),
    }),
  },
})

// ── Mock global fetch ──
const originalFetch = globalThis.fetch
globalThis.fetch = (...args) => fetchImpl(...args)

// ── Mock firebase-functions/v2/database ──
mock.module('firebase-functions/v2/database', {
  namedExports: {
    onValueWritten: (_opts, handler) => handler || _opts,
  },
})

// ── Import ──
const { dispatchwebhook } = await import('../dispatch-webhook.js')

// ── Helpers ──
function makeEvent(bookingId, afterVal) {
  return {
    params: { bookingId },
    data: {
      after: { val: () => afterVal },
      before: { val: () => null },
    },
  }
}

describe('dispatch-webhook smoke', () => {
  after(() => {
    globalThis.fetch = originalFetch
  })

  beforeEach(() => {
    subscriptionsVal = null
    fetchImpl = () => Promise.resolve({ status: 200 })
    refGetCalls = 0
    refUpdateCalls = 0
    refPushCalls = 0
  })

  it('exports dispatchwebhook as a function', () => {
    assert.equal(typeof dispatchwebhook, 'function')
  })

  it('skips dispatch for deleted bookings (null after)', async () => {
    const event = makeEvent('bkg_01', null)
    await dispatchwebhook(event)
    assert.equal(refGetCalls, 0)
  })

  it('skips bookings with no hostId', async () => {
    const event = makeEvent('bkg_02', { bid: 'bkg_02', status: 'confirmed' })
    await dispatchwebhook(event)
    assert.equal(refGetCalls, 0)
  })

  it('skips when host has no subscriptions', async () => {
    subscriptionsVal = null
    const event = makeEvent('bkg_03', {
      bid: 'bkg_03', hostId: 'host_none', status: 'confirmed',
      inviteeId: 'inv_1', eventTypeId: 'et1', date: '2025-06-01',
      formData: {}, createdAt: new Date().toISOString(),
    })
    await dispatchwebhook(event)
    assert.equal(refGetCalls, 1)
  })

  it('dispatches to matching active subscriptions', async () => {
    subscriptionsVal = {
      sub_1: {
        active: true, url: 'https://example.com/hook',
        secret: 'sec1', events: ['invitee.created'], deliveryCount: 0,
      },
      sub_2: {
        active: false, url: 'https://example.com/no',
        secret: 'sec2', events: ['invitee.created'],
      },
    }
    const event = makeEvent('bkg_04', {
      bid: 'bkg_04', hostId: 'host_hooks', status: 'confirmed',
      inviteeId: 'inv_1', eventTypeId: 'et1', date: '2025-06-01',
      formData: {}, createdAt: new Date().toISOString(),
    })
    await dispatchwebhook(event)
    // refGetCalls === 1 (read subscriptions) + at least 1 refUpdateCalls for delivery stats
    assert.equal(refGetCalls, 1, 'expected 1 DB read for subscriptions')
    assert.ok(refUpdateCalls >= 1, 'expected delivery stats update')
  })

  it('dispatches cancelled event type correctly', async () => {
    subscriptionsVal = {
      sub_cancel: {
        active: true, url: 'https://example.com/cancel',
        secret: 'sec', events: ['invitee.canceled'], deliveryCount: 0,
      },
    }
    const event = makeEvent('bkg_05', {
      bid: 'bkg_05', hostId: 'host_cancel', status: 'cancelled',
      inviteeId: 'inv_1', eventTypeId: 'et1', date: '2025-06-01',
      formData: {}, createdAt: new Date().toISOString(),
    })
    await dispatchwebhook(event)
    assert.equal(refUpdateCalls, 1, 'expected delivery stats update for cancel')
  })

  it('retry: exhausts attempts and writes to DLQ', async () => {
    // Simulate failed deliveries to trigger DLQ
    subscriptionsVal = {
      sub_dlq: {
        active: true, url: 'https://example.com/dlq',
        secret: 'sec', events: ['invitee.created'], deliveryCount: 0,
      },
    }
    let fetchCalls = 0
    fetchImpl = () => {
      fetchCalls++
      return Promise.reject(new Error('network error'))
    }

    // Speed up retries by mocking setTimeout
    const origSetTimeout = globalThis.setTimeout
    globalThis.setTimeout = (fn, ms) => origSetTimeout(fn, 0)

    try {
      const event = makeEvent('bkg_06', {
        bid: 'bkg_06', hostId: 'host_dlq', status: 'confirmed',
        inviteeId: 'inv_1', eventTypeId: 'et1', date: '2025-06-01',
        formData: {}, createdAt: new Date().toISOString(),
      })
      await dispatchwebhook(event)
      // All 4 attempts (1 initial + 3 retries) should have tried fetch
      assert.equal(fetchCalls, 4, 'expected 4 fetch attempts (1 + 3 retries)')
      // DLQ push should have been called
      assert.ok(refPushCalls >= 1, 'expected DLQ push after retry exhaustion')
    } finally {
      globalThis.setTimeout = origSetTimeout
    }
  })
})
