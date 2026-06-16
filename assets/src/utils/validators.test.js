/**
 * validators.test.js — Unit tests for input validators.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  validateEmail, validateUrl, validateRequired, validateMinLength,
  validateMaxLength, validateTimeFormat, validateWebhookUrl,
  validateEventType, validateBookingForm,
} from './validators.js'

describe('validateEmail', () => {
  it('accepts valid email', () => {
    assert.equal(validateEmail('user@domain.com').valid, true)
  })

  it('rejects empty', () => {
    const r = validateEmail('')
    assert.equal(r.valid, false)
    assert.ok(r.errors[0].message.includes('required'))
  })

  it('rejects missing @', () => {
    assert.equal(validateEmail('notanemail').valid, false)
  })

  it('rejects missing domain', () => {
    assert.equal(validateEmail('a@').valid, false)
  })

  it('rejects >254 chars', () => {
    const long = 'a'.repeat(250) + '@b.com'
    assert.equal(validateEmail(long).valid, false)
  })

  it('returns custom field name in error', () => {
    const r = validateEmail('', 'Contact Email')
    assert.equal(r.errors[0].field, 'Contact Email')
  })
})

describe('validateUrl', () => {
  it('accepts https URL', () => {
    assert.equal(validateUrl('https://example.com').valid, true)
  })

  it('accepts http URL', () => {
    assert.equal(validateUrl('http://localhost:3000').valid, true)
  })

  it('rejects ftp URL', () => {
    assert.equal(validateUrl('ftp://files.com').valid, false)
  })

  it('rejects empty', () => {
    assert.equal(validateUrl('').valid, false)
  })

  it('rejects >2048 chars', () => {
    const long = 'https://a.com/' + 'x'.repeat(2048)
    assert.equal(validateUrl(long).valid, false)
  })
})

describe('validateRequired', () => {
  it('accepts non-empty', () => {
    assert.equal(validateRequired('hello', 'Name').valid, true)
  })

  it('rejects empty string', () => {
    assert.equal(validateRequired('', 'Name').valid, false)
  })

  it('rejects null', () => {
    assert.equal(validateRequired(null, 'Name').valid, false)
  })

  it('rejects undefined', () => {
    assert.equal(validateRequired(undefined, 'Name').valid, false)
  })
})

describe('validateMinLength', () => {
  it('accepts string at min length', () => {
    assert.equal(validateMinLength('abc', 3, 'Code').valid, true)
  })

  it('rejects shorter string', () => {
    assert.equal(validateMinLength('ab', 3, 'Code').valid, false)
  })
})

describe('validateMaxLength', () => {
  it('accepts string at max length', () => {
    assert.equal(validateMaxLength('abc', 3, 'Code').valid, true)
  })

  it('rejects longer string', () => {
    assert.equal(validateMaxLength('abcd', 3, 'Code').valid, false)
  })
})

describe('validateTimeFormat', () => {
  it('accepts valid time', () => {
    assert.equal(validateTimeFormat('09:00').valid, true)
    assert.equal(validateTimeFormat('23:59').valid, true)
  })

  it('rejects invalid hour', () => {
    assert.equal(validateTimeFormat('25:00').valid, false)
  })

  it('rejects invalid format', () => {
    assert.equal(validateTimeFormat('9:00').valid, false)
    assert.equal(validateTimeFormat('0900').valid, false)
  })
})

describe('validateWebhookUrl', () => {
  it('accepts valid webhook URL', () => {
    assert.equal(validateWebhookUrl('https://hooks.example.com/webhook').valid, true)
  })

  it('rejects empty', () => {
    assert.equal(validateWebhookUrl('').valid, false)
  })

  it('rejects non-http', () => {
    assert.equal(validateWebhookUrl('ftp://bad.com').valid, false)
  })
})

describe('validateEventType', () => {
  it('accepts valid event type', () => {
    const r = validateEventType({ title: 'Strategy Call', duration: 45, location: 'zoom', color: '#7047EB' })
    assert.equal(r.valid, true)
  })

  it('rejects missing title', () => {
    const r = validateEventType({ duration: 45 })
    assert.equal(r.valid, false)
    assert.ok(r.errors.some(e => e.field === 'Title'))
  })

  it('rejects duration < 5', () => {
    const r = validateEventType({ title: 'X', duration: 0 })
    assert.equal(r.valid, false)
  })

  it('rejects duration > 480', () => {
    const r = validateEventType({ title: 'X', duration: 500 })
    assert.equal(r.valid, false)
  })

  it('rejects non-integer duration', () => {
    const r = validateEventType({ title: 'X', duration: 45.5 })
    assert.equal(r.valid, false)
  })

  it('rejects unknown location', () => {
    const r = validateEventType({ title: 'X', duration: 30, location: 'discord' })
    assert.equal(r.valid, false)
  })

  it('accepts zoom/meet/teams/none locations', () => {
    for (const loc of ['zoom', 'meet', 'teams', 'none']) {
      assert.equal(validateEventType({ title: 'X', duration: 30, location: loc }).valid, true)
    }
  })

  it('rejects invalid color', () => {
    const r = validateEventType({ title: 'X', duration: 30, color: 'red' })
    assert.equal(r.valid, false)
  })
})

describe('validateBookingForm', () => {
  const fields = [
    { id: 'name', label: 'Name', type: 'text', required: true },
    { id: 'email', label: 'Email', type: 'email', required: true },
    { id: 'notes', label: 'Notes', type: 'textarea', required: false },
  ]

  it('accepts valid form data', () => {
    const r = validateBookingForm({ name: 'Amir', email: 'a@b.com', notes: '' }, fields)
    assert.equal(r.valid, true)
  })

  it('rejects missing required field', () => {
    const r = validateBookingForm({ email: 'a@b.com' }, fields)
    assert.equal(r.valid, false)
    assert.ok(r.errors.some(e => e.field === 'Name'))
  })

  it('rejects invalid email', () => {
    const r = validateBookingForm({ name: 'Amir', email: 'bad' }, fields)
    assert.equal(r.valid, false)
    assert.ok(r.errors.some(e => e.field === 'Email'))
  })

  it('accepts missing optional field', () => {
    const r = validateBookingForm({ name: 'Amir', email: 'a@b.com' }, fields)
    assert.equal(r.valid, true)
  })

  it('rejects fields over max custom length', () => {
    const longName = 'x'.repeat(501)
    const r = validateBookingForm({ name: longName, email: 'a@b.com' }, fields)
    assert.equal(r.valid, false)
  })
})
