/**
 * event-type.service.js — Event type CRUD.
 *
 * Soft delete (active=false). Free tier max 1 event type.
 * No price/currency fields (internal tool).
 */

import { AsyncResult } from '../utils/Result.js'
import { dbRef, dbRead, dbWrite, dbUpdate } from '../db.js'
import { getCurrentUser } from './auth.service.js'
import { generateRandomHex } from '../utils/crypto.js'

const MAX_FREE_EVENT_TYPES = 1

/**
 * Create a new event type.
 * @param {Object} data — { title, duration, location?, color?, description?, requiresPhi?, bookingRules?, formFields? }
 * @returns {AsyncResult}
 */
export function createEventType(data) {
  return AsyncResult.from((async () => {
    const user = getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    const uid = user.uid

    // Free tier check
    const [existing, readErr] = await listEventTypes(uid).unwrap()
    if (readErr) throw readErr
    const activeCount = (existing || []).filter(e => e.active !== false).length
    if (activeCount >= MAX_FREE_EVENT_TYPES) {
      throw new Error(`Free tier limited to ${MAX_FREE_EVENT_TYPES} event type. Upgrade to create more.`)
    }

    const eid = 'evt_' + generateRandomHex(8)
    const now = new Date().toISOString()
    const eventType = {
      eid,
      title: data.title,
      description: data.description || '',
      duration: data.duration,
      location: data.location || 'none',
      color: data.color || '#7047EB',
      requiresPhi: data.requiresPhi || false,
      visibility: data.visibility || 'public',
      bookingRules: data.bookingRules || {},
      formFields: data.formFields || [
        { id: 'name', label: 'Your Name', type: 'text', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true },
      ],
      active: true,
      createdAt: now,
      updatedAt: now,
    }
    await dbWrite(dbRef(`/event_types/${uid}/${eid}`), eventType).unwrapOrThrow()
    return eventType
  })())
}

/**
 * List all event types for a user.
 * @param {string} uid
 * @returns {AsyncResult}
 */
export function listEventTypes(uid, { publicOnly = false } = {}) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/event_types/${uid}`)).unwrap()
    if (err) throw err
    if (!data) return []
    const all = Object.values(data)
    if (publicOnly) {
      return all.filter(e => e.active !== false && e.visibility !== 'hidden')
    }
    return all
  })())
}

/**
 * Get a single event type.
 * @param {string} uid
 * @param {string} eid
 * @returns {AsyncResult}
 */
export function getEventType(uid, eid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/event_types/${uid}/${eid}`)).unwrap()
    if (err) throw err
    if (!data) throw new Error('Event type not found')
    return data
  })())
}

/**
 * Update an event type with partial data.
 * @param {string} uid
 * @param {string} eid
 * @param {Object} patch
 * @returns {AsyncResult}
 */
export function updateEventType(uid, eid, patch) {
  return AsyncResult.from((async () => {
    patch.updatedAt = new Date().toISOString()
    return await dbUpdate(dbRef(`/event_types/${uid}/${eid}`), patch).unwrapOrThrow()
  })())
}

/**
 * Soft-delete an event type (sets active=false).
 * @param {string} uid
 * @param {string} eid
 * @returns {AsyncResult}
 */
export function deleteEventType(uid, eid) {
  return updateEventType(uid, eid, { active: false, updatedAt: new Date().toISOString() })
}

/**
 * Get a public event type for booking (excludes hidden).
 * @param {string} uid — host's UID
 * @param {string} eid — event type ID
 * @returns {AsyncResult}
 */
export function getPublicEventType(uid, eid) {
  return AsyncResult.from((async () => {
    const [et, err] = await getEventType(uid, eid).unwrap()
    if (err) throw err
    if (!et.active) throw new Error('This event type is no longer available')
    if (et.visibility === 'hidden') throw new Error('Event type not found')
    return et
  })())
}
