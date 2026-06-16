/**
 * Smoke tests for book-slot.js
 *
 * Run: node --experimental-test-module-mocks --test functions/src/__tests__/book-slot.smoke.test.js
 */

import { describe, it, mock, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

// ── Configurable mock DB state ──
let slotSnapshot = { exists: () => false, val: () => null }

// ── Mock firebase-admin/app ──
mock.module('firebase-admin/app', {
  namedExports: { initializeApp: () => {} },
})

// ── Mock firebase-admin/database ──
mock.module('firebase-admin/database', {
  namedExports: {
    getDatabase: () => {
      const txn = {
        get: () => Promise.resolve(slotSnapshot),
        set: () => {},
      }
      return {
        ref: () => ({
          get: () => Promise.resolve(slotSnapshot),
          set: () => Promise.resolve(),
          update: () => Promise.resolve(),
          push: () => Promise.resolve({ key: 'mock_key' }),
        }),
        runTransaction: (updateFn) => updateFn(txn),
      }
    },
  },
})

// ── Mock firebase-functions/v2/https ──
mock.module('firebase-functions/v2/https', {
  namedExports: {
    onRequest: (_opts, handler) => {
      const fn = handler || _opts
      return fn
    },
  },
})

// ── Import ──
const { bookslot } = await import('../book-slot.js')

// ── Helpers ──
function mockRes() {
  const res = {
    _status: 200,
    _json: null,
    status(code) { res._status = code; return res },
    json(data) { res._json = data; return res },
  }
  return res
}

function mockReq(method, body) {
  return { method, body: body ?? {} }
}

describe('book-slot smoke', () => {
  beforeEach(() => {
    // Reset to default: slot does not exist
    slotSnapshot = { exists: () => false, val: () => null }
  })

  it('exports bookslot as a function', () => {
    assert.equal(typeof bookslot, 'function')
  })

  it('returns 405 for GET', async () => {
    const res = mockRes()
    await bookslot(mockReq('GET'), res)
    assert.equal(res._status, 405)
    assert.equal(res._json.error, 'Method not allowed')
  })

  it('returns 400 for missing required fields', async () => {
    const res = mockRes()
    await bookslot(mockReq('POST', null), res)
    assert.equal(res._status, 400)
    assert.ok(res._json.error.includes('Missing required fields'))
  })

  it('returns 400 for invalid date format', async () => {
    const res = mockRes()
    await bookslot(mockReq('POST', {
      hostId: 'h1', date: 'bad', slotId: 'slt_abc', eventTypeId: 'et1',
    }), res)
    assert.equal(res._status, 400)
    assert.equal(res._json.error, 'Invalid date format. Use YYYY-MM-DD.')
  })

  it('returns 400 for invalid slotId', async () => {
    const res = mockRes()
    await bookslot(mockReq('POST', {
      hostId: 'h1', date: '2025-06-01', slotId: 'bad', eventTypeId: 'et1',
    }), res)
    assert.equal(res._status, 400)
    assert.equal(res._json.error, 'Invalid slotId format.')
  })

  it('returns 400 when authenticated invitee lacks email', async () => {
    const res = mockRes()
    await bookslot(mockReq('POST', {
      hostId: 'h1', date: '2025-06-01', slotId: 'slt_abc',
      eventTypeId: 'et1', inviteeId: 'inv_1', formData: {},
    }), res)
    assert.equal(res._status, 400)
    assert.equal(res._json.error, 'formData.email is required for authenticated bookings')
  })

  it('slot_missing: returns 409 when slot does not exist', async () => {
    // beforeEach reset to slot DNE
    const res = mockRes()
    await bookslot(mockReq('POST', {
      hostId: 'h1', date: '2025-06-01', slotId: 'slt_abc', eventTypeId: 'et1',
    }), res)
    assert.equal(res._status, 409)
    assert.equal(res._json.code, 'slot_missing')
  })

  it('slot_taken: returns 409 when slot is already busy', async () => {
    slotSnapshot = { exists: () => true, val: () => ({ status: 'busy' }) }
    const res = mockRes()
    await bookslot(mockReq('POST', {
      hostId: 'h1', date: '2025-06-01', slotId: 'slt_abc', eventTypeId: 'et1',
    }), res)
    assert.equal(res._status, 409)
    assert.equal(res._json.code, 'slot_taken')
  })

  it('valid booking: returns 200 with booking and workspace', async () => {
    slotSnapshot = { exists: () => true, val: () => ({ status: 'free' }) }
    const res = mockRes()
    await bookslot(mockReq('POST', {
      hostId: 'h1', date: '2025-06-01', slotId: 'slt_abc', eventTypeId: 'et1',
    }), res)
    assert.equal(res._status, 200)
    assert.equal(res._json.success, true)
    assert.ok(res._json.booking, 'expected booking object')
    assert.ok(res._json.booking.bid, 'expected booking ID')
    assert.equal(res._json.booking.status, 'confirmed')
    assert.ok(res._json.workspace, 'expected workspace object')
    assert.ok(res._json.workspace.wid, 'expected workspace ID')
  })
})
