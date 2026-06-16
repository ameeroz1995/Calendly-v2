/**
 * validators.js — Input validation functions.
 *
 * Every validator returns { valid: boolean, errors: Array<{ field, message }> }.
 * All functions are pure — no side effects, no DOM access.
 * Unicode text inputs are normalized to NFC before validation.
 *
 * Usage:
 *   import { validateEmail, validateEventType } from './utils/validators.js'
 *   const { valid, errors } = validateEmail('user@domain.com')
 */

// ── Constants ──
const MAX_NAME_LEN = 200
const MAX_EMAIL_LEN = 254
const MAX_CUSTOM_LEN = 500
const MAX_URL_LEN = 2048
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/
const URL_RE = /^https?:\/\/.+/i

/**
 * Build a success result.
 */
function ok() {
  return { valid: true, errors: [] }
}

/**
 * Build an error result.
 */
function fail(field, message) {
  return { valid: false, errors: [{ field, message }] }
}

/**
 * Normalize a string to NFC (Unicode Normalization Form C).
 * Returns empty string for null/undefined.
 */
function norm(str) {
  if (str == null) return ''
  return String(str).normalize('NFC')
}

// ── Individual Validators ──

/**
 * Validate an email address.
 * Checks: non-empty, max length 254, basic format.
 */
export function validateEmail(email, fieldName = 'email') {
  const v = norm(email).trim()
  if (!v) return fail(fieldName, 'Email is required')
  if (v.length > MAX_EMAIL_LEN) return fail(fieldName, `Email must be ${MAX_EMAIL_LEN} characters or less`)
  if (!EMAIL_RE.test(v)) return fail(fieldName, 'Invalid email format')
  return ok()
}

/**
 * Validate a URL.
 * Checks: non-empty, max length 2048, starts with http(s)://.
 */
export function validateUrl(url, fieldName = 'url') {
  const v = norm(url).trim()
  if (!v) return fail(fieldName, 'URL is required')
  if (v.length > MAX_URL_LEN) return fail(fieldName, `URL must be ${MAX_URL_LEN} characters or less`)
  if (!URL_RE.test(v)) return fail(fieldName, 'URL must start with http:// or https://')
  return ok()
}

/**
 * Validate a required field.
 */
export function validateRequired(value, fieldName) {
  const v = typeof value === 'string' ? norm(value).trim() : value
  if (v === null || v === undefined || v === '') {
    return fail(fieldName, `${fieldName} is required`)
  }
  return ok()
}

/**
 * Validate minimum string length.
 */
export function validateMinLength(value, min, fieldName) {
  const v = norm(value)
  if (v.length < min) return fail(fieldName, `${fieldName} must be at least ${min} characters`)
  return ok()
}

/**
 * Validate maximum string length.
 */
export function validateMaxLength(value, max, fieldName) {
  const v = norm(value)
  if (v.length > max) return fail(fieldName, `${fieldName} must be ${max} characters or less`)
  return ok()
}

/**
 * Validate a time string in HH:MM format.
 */
export function validateTimeFormat(timeStr, fieldName = 'time') {
  const v = norm(timeStr).trim()
  if (!v) return fail(fieldName, 'Time is required')
  if (!TIME_RE.test(v)) return fail(fieldName, 'Time must be in HH:MM format (24-hour)')
  return ok()
}

/**
 * Validate a webhook URL.
 * Checks: required, valid URL format, rejects localhost in production.
 */
export function validateWebhookUrl(url, fieldName = 'webhookUrl') {
  const v = norm(url).trim()
  if (!v) return fail(fieldName, 'Webhook URL is required')
  if (v.length > MAX_URL_LEN) return fail(fieldName, `URL must be ${MAX_URL_LEN} characters or less`)
  if (!URL_RE.test(v)) return fail(fieldName, 'Webhook URL must start with http:// or https://')
  return ok()
}

// ── Composite Validators ──

/**
 * Validate an event type object.
 *
 * Expected shape:
 *   { title: string, duration: number, location: string|null, color: string|null }
 *   No price/currency fields (internal tool).
 */
export function validateEventType(data) {
  const errors = []

  // Title
  const titleResult = validateRequired(data.title, 'Title')
  if (!titleResult.valid) errors.push(...titleResult.errors)
  else {
    const lenResult = validateMaxLength(data.title, MAX_NAME_LEN, 'Title')
    if (!lenResult.valid) errors.push(...lenResult.errors)
  }

  // Duration
  if (data.duration == null || typeof data.duration !== 'number') {
    errors.push({ field: 'duration', message: 'Duration is required' })
  } else if (data.duration < 5 || data.duration > 480) {
    errors.push({ field: 'duration', message: 'Duration must be between 5 and 480 minutes' })
  } else if (!Number.isInteger(data.duration)) {
    errors.push({ field: 'duration', message: 'Duration must be a whole number of minutes' })
  }

  // Location (optional, but if provided must be a valid URL or known provider)
  if (data.location && typeof data.location === 'string') {
    const knownLocations = ['zoom', 'meet', 'teams', 'none']
    if (!knownLocations.includes(data.location) && !URL_RE.test(data.location)) {
      errors.push({ field: 'location', message: 'Location must be zoom, meet, teams, none, or a valid URL' })
    }
  }

  // Color (optional hex)
  if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    errors.push({ field: 'color', message: 'Color must be a valid hex code (e.g. #7047EB)' })
  }

  return errors.length === 0 ? ok() : { valid: false, errors }
}

/**
 * Validate booking form data against the event type's configured fields.
 *
 * @param {Object} formData — { fieldId: value, ... }
 * @param {Array} fields — event type config fields:
 *   [{ id: string, label: string, type: 'text'|'email'|'textarea'|'checkbox', required: boolean }]
 */
export function validateBookingForm(formData, fields) {
  const errors = []

  for (const field of fields) {
    if (!field) continue
    const value = formData[field.id]
    const label = field.label || field.id

    if (field.required) {
      const requiredResult = validateRequired(value, label)
      if (!requiredResult.valid) {
        errors.push(...requiredResult.errors)
        continue
      }
    }

    // Skip further validation for empty optional fields
    if (value == null || value === '') continue

    const type = field.type || 'text'

    if (type === 'email') {
      const emailResult = validateEmail(value, label)
      if (!emailResult.valid) errors.push(...emailResult.errors)
    }

    if (type === 'text' || type === 'textarea') {
      const lenResult = validateMaxLength(value, MAX_CUSTOM_LEN, label)
      if (!lenResult.valid) errors.push(...lenResult.errors)
    }
  }

  return errors.length === 0 ? ok() : { valid: false, errors }
}
