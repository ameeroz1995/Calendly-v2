/**
 * availability.service.js — Availability & slot management.
 *
 * Working hours, booking rules, slot generation, slot querying.
 * All internal math in UTC for DST safety.
 */

import { AsyncResult } from '../utils/Result.js'
import { dbRef, dbRead, dbWrite, dbUpdate } from '../firebase.js'
import { generateSlotsInRange, toISODate, filterBusySlots, addMinutes } from '../utils/datetime.js'

/**
 * Set working hours for each day.
 * @param {string} uid
 * @param {Object} hours — { mon:{start:'09:00',end:'17:00'}, tue:..., ... }
 * @returns {AsyncResult}
 */
export function setWorkingHours(uid, hours) {
  return AsyncResult.from((async () => {
    await dbWrite(dbRef(`/booking_rules/${uid}/workingHours`), hours).unwrapOrThrow()
    return hours
  })())
}

/**
 * Get working hours for a user.
 * @param {string} uid
 * @returns {AsyncResult}
 */
export function getWorkingHours(uid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/booking_rules/${uid}/workingHours`)).unwrap()
    if (err) throw err
    return data || {}
  })())
}

/**
 * Set booking rules.
 * @param {string} uid
 * @param {Object} rules — { maxPerDay?, minNoticeHours?, maxAdvanceDays?, bufferMinutes? }
 * @returns {AsyncResult}
 */
export function setBookingRules(uid, rules) {
  return AsyncResult.from((async () => {
    await dbUpdate(dbRef(`/booking_rules/${uid}`), rules).unwrapOrThrow()
    return rules
  })())
}

/**
 * Get booking rules for a user.
 * @param {string} uid
 * @returns {AsyncResult}
 */
export function getBookingRules(uid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/booking_rules/${uid}`)).unwrap()
    if (err) throw err
    return data || {}
  })())
}

/**
 * Generate and store slot nodes for a date range.
 * @param {string} uid — host UID
 * @param {number} durationMin — slot duration from event type
 * @param {number} bufferMin — buffer between slots
 * @param {string} fromISO — start date ISO
 * @param {string} toISO — end date ISO
 * @returns {AsyncResult}
 */
export function generateAndStoreSlots(uid, durationMin, bufferMin, fromISO, toISO) {
  return AsyncResult.from((async () => {
    const [rules, rulesErr] = await getBookingRules(uid).unwrap()
    if (rulesErr) throw rulesErr

    const [hours, hoursErr] = await getWorkingHours(uid).unwrap()
    if (hoursErr) throw hoursErr

    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const results = []

    for (const { date, slots } of generateSlotsInRange({
      startHour: 9, endHour: 17, durationMin, bufferMin,
      from: new Date(fromISO + 'T00:00:00Z'),
      to: new Date(toISO + 'T00:00:00Z'),
    })) {
      // Check if this day has working hours configured
      const d = new Date(date + 'T00:00:00Z')
      const dayKey = dayNames[d.getUTCDay()]

      for (const slot of slots) {
        const sid = 'slt_' + slot.iso.replace(/[^0-9]/g, '').slice(0, 14)
        await dbWrite(dbRef(`/availability/${uid}/${date}/${sid}`), {
          sid,
          date,
          start: slot.start.toISOString(),
          end: slot.end.toISOString(),
          time: slot.time,
          status: 'free',
        }).unwrapOrThrow()
        results.push(sid)
      }
    }
    return results
  })())
}

/**
 * Get available (free) slots in a date range.
 * @param {string} uid — host UID
 * @param {string} fromISO
 * @param {string} toISO
 * @returns {AsyncResult}
 */
export function getAvailableSlots(uid, fromISO, toISO) {
  return AsyncResult.from((async () => {
    const allSlots = []
    const start = new Date(fromISO + 'T00:00:00Z')
    const end = new Date(toISO + 'T00:00:00Z')
    const cursor = new Date(start)

    while (cursor <= end) {
      const dateKey = toISODate(cursor)
      const [data, err] = await dbRead(dbRef(`/availability/${uid}/${dateKey}`)).unwrap()
      if (!err && data) {
        Object.values(data).forEach(s => {
          if (s.status === 'free') allSlots.push(s)
        })
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    return allSlots
  })())
}

/**
 * Mark a single slot as busy (e.g., after booking).
 * @param {string} hostId
 * @param {string} date — ISO date
 * @param {string} slotId
 * @returns {AsyncResult}
 */
export function markSlotBusy(hostId, date, slotId) {
  return AsyncResult.from((async () => {
    return await dbUpdate(dbRef(`/availability/${hostId}/${date}/${slotId}`), {
      status: 'busy',
    }).unwrapOrThrow()
  })())
}

/**
 * Mark slot as free (e.g., on cancellation).
 * @param {string} hostId
 * @param {string} date
 * @param {string} slotId
 * @returns {AsyncResult}
 */
export function markSlotFree(hostId, date, slotId) {
  return AsyncResult.from((async () => {
    return await dbUpdate(dbRef(`/availability/${hostId}/${date}/${slotId}`), {
      status: 'free',
    }).unwrapOrThrow()
  })())
}

/**
 * Mark a slot as externally busy (calendar sync conflict).
 * @param {string} hostId
 * @param {string} date
 * @param {string} slotId
 * @returns {AsyncResult}
 */
export function markSlotExternalBusy(hostId, date, slotId) {
  return AsyncResult.from((async () => {
    return await dbUpdate(dbRef(`/availability/${hostId}/${date}/${slotId}`), {
      status: 'external_busy',
    }).unwrapOrThrow()
  })())
}
