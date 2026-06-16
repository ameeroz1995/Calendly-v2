/**
 * resource.service.js — Resource booking (meeting rooms, equipment, spaces).
 *
 * RTDB: /resources/{rid}
 * Resources can't be double-booked — conflict check runs before confirming.
 * View: /resources
 */

import { AsyncResult } from '../utils/Result.js'
import { dbRef, dbRead, dbWrite, dbUpdate, dbRemove } from '../firebase.js'
import { generateRandomHex } from '../utils/crypto.js'

const RESOURCE_TYPES = ['room', 'equipment', 'space']

/**
 * Create a bookable resource.
 *
 * @param {string} uid — admin/owner UID
 * @param {Object} data — { name, type:'room'|'equipment'|'space', capacity?, location? }
 * @returns {AsyncResult}
 */
export function createResource(uid, data) {
  return AsyncResult.from((async () => {
    if (!RESOURCE_TYPES.includes(data.type)) {
      throw new Error(`Invalid resource type. Must be one of: ${RESOURCE_TYPES.join(', ')}`)
    }

    const rid = 'res_' + generateRandomHex(8)
    const now = new Date().toISOString()
    await dbWrite(dbRef(`/resources/${rid}`), {
      rid,
      name: data.name,
      type: data.type,
      capacity: data.capacity || null,
      location: data.location || '',
      ownerId: uid,
      active: true,
      createdAt: now,
      updatedAt: now,
    }).unwrapOrThrow()
    return rid
  })())
}

/**
 * Get a resource by ID.
 * @param {string} rid
 * @returns {AsyncResult}
 */
export function getResource(rid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/resources/${rid}`)).unwrap()
    if (err) throw err
    if (!data) throw new Error('Resource not found')
    return data
  })())
}

/**
 * List all resources.
 * @param {Object} filters — { type?, active? }
 * @returns {AsyncResult}
 */
export function listResources(filters = {}) {
  return AsyncResult.from((async () => {
    const [all, err] = await dbRead(dbRef('/resources')).unwrap()
    if (err) throw err
    if (!all) return []
    let results = Object.values(all)
    if (filters.type) results = results.filter(r => r.type === filters.type)
    if (filters.active !== undefined) results = results.filter(r => r.active === filters.active)
    return results
  })())
}

/**
 * Update a resource's properties.
 * @param {string} rid
 * @param {Object} patch
 * @returns {AsyncResult}
 */
export function updateResource(rid, patch) {
  return AsyncResult.from((async () => {
    patch.updatedAt = new Date().toISOString()
    await dbUpdate(dbRef(`/resources/${rid}`), patch).unwrapOrThrow()
    return true
  })())
}

/**
 * Soft-delete a resource.
 * @param {string} rid
 * @returns {AsyncResult}
 */
export function deleteResource(rid) {
  return updateResource(rid, { active: false })
}

/**
 * Check if a resource is available at a given time.
 *
 * @param {string} rid — resource ID
 * @param {Date} start — requested start
 * @param {Date} end — requested end
 * @returns {AsyncResult} resolving to { available: boolean, conflict?: Object }
 */
export function checkResourceAvailability(rid, start, end) {
  return AsyncResult.from((async () => {
    const [resource, resErr] = await getResource(rid).unwrap()
    if (resErr) throw resErr
    if (!resource.active) throw new Error('Resource is not active')

    // Get all bookings for this resource
    const [allBookings, bkErr] = await dbRead(dbRef('/resource_bookings')).unwrap()
    if (bkErr) throw bkErr

    const existing = allBookings ? Object.values(allBookings).filter(
      b => b.rid === rid && b.status === 'confirmed'
    ) : []

    // Check for overlap
    const startMs = start.getTime()
    const endMs = end.getTime()
    const conflict = existing.find(b =>
      startMs < new Date(b.end).getTime() && new Date(b.start).getTime() < endMs
    )

    if (conflict) {
      return {
        available: false,
        conflict: {
          bookingId: conflict.bid,
          start: conflict.start,
          end: conflict.end,
          bookedBy: conflict.userId,
        },
      }
    }

    return { available: true }
  })())
}

/**
 * Book a resource for a time slot.
 *
 * @param {string} rid — resource ID
 * @param {string} userId — who is booking
 * @param {Date} start
 * @param {Date} end
 * @param {Object} metadata — { eventTypeId?, bookingId?, notes? }
 * @returns {AsyncResult}
 */
export function bookResource(rid, userId, start, end, metadata = {}) {
  return AsyncResult.from((async () => {
    // Conflict check
    const [check, checkErr] = await checkResourceAvailability(rid, start, end).unwrap()
    if (checkErr) throw checkErr
    if (!check.available) {
      throw new Error(`Resource is already booked during this time${check.conflict ? ' (conflict: ' + check.conflict.bookingId + ')' : ''}`)
    }

    const bid = 'rbk_' + generateRandomHex(8)
    const now = new Date().toISOString()
    await dbWrite(dbRef(`/resource_bookings/${bid}`), {
      bid,
      rid,
      userId,
      start: start.toISOString(),
      end: end.toISOString(),
      status: 'confirmed',
      eventTypeId: metadata.eventTypeId || null,
      bookingId: metadata.bookingId || null,
      notes: metadata.notes || '',
      createdAt: now,
    }).unwrapOrThrow()

    return bid
  })())
}

/**
 * Cancel a resource booking.
 * @param {string} bid
 * @returns {AsyncResult}
 */
export function cancelResourceBooking(bid) {
  return AsyncResult.from((async () => {
    await dbUpdate(dbRef(`/resource_bookings/${bid}`), {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    }).unwrapOrThrow()
    return true
  })())
}

/**
 * Get all bookings for a resource.
 * @param {string} rid
 * @param {string} [date] — ISO date to filter by
 * @returns {AsyncResult}
 */
export function getResourceBookings(rid, date) {
  return AsyncResult.from((async () => {
    const [all, err] = await dbRead(dbRef('/resource_bookings')).unwrap()
    if (err) throw err
    if (!all) return []
    let results = Object.values(all).filter(b => b.rid === rid && b.status === 'confirmed')
    if (date) {
      results = results.filter(b => b.start.startsWith(date))
    }
    return results.sort((a, b) => a.start.localeCompare(b.start))
  })())
}
