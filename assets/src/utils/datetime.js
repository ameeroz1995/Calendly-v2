/**
 * datetime.js — Date/Time utilities.
 *
 * All internal math in UTC for DST safety. Slot generation, date formatting,
 * month grids, overlap detection. Zero dependencies.
 *
 * Usage:
 *   import { generateSlots, formatDate, getMonthGrid } from './utils/datetime.js'
 *   const slots = generateSlots({ startHour: 9, endHour: 17, durationMin: 30, bufferMin: 15 })
 */

// ── Constants ──
const MS_PER_MINUTE = 60000
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

// ── Slot Generation ──

/**
 * Generate non-overlapping time slots for a single day.
 *
 * @param {Object} opts
 * @param {number} opts.startHour — e.g. 9 for 9:00 AM
 * @param {number} opts.endHour — e.g. 17 for 5:00 PM
 * @param {number} opts.durationMin — slot duration in minutes
 * @param {number} [opts.bufferMin=0] — buffer between slots in minutes
 * @param {Date} [opts.date] — date to generate slots for (defaults to today in UTC)
 * @returns {Array<{ start: Date, end: Date, iso: string, time: string }>}
 */
export function generateSlots({ startHour, endHour, durationMin, bufferMin = 0, date }) {
  const base = date ? new Date(date) : new Date()
  // Normalize to UTC midnight
  base.setUTCHours(0, 0, 0, 0)

  const slots = []
  const stepMs = (durationMin + bufferMin) * MS_PER_MINUTE
  const endMs = endHour * 60 * MS_PER_MINUTE

  let cursorMs = startHour * 60 * MS_PER_MINUTE

  while (cursorMs + durationMin * MS_PER_MINUTE <= endMs) {
    const start = new Date(base.getTime() + cursorMs)
    const end = new Date(start.getTime() + durationMin * MS_PER_MINUTE)
    slots.push({
      start,
      end,
      iso: start.toISOString(),
      time: formatTime(start),
    })
    cursorMs += stepMs
  }

  return slots
}

/**
 * Generate slots for a date range.
 * Skips DST spring-forward hour (no slots generated in skipped hour).
 * For DST fall-back (repeated hour), generates only the first occurrence.
 *
 * @param {Object} opts — same as generateSlots plus:
 * @param {Date} opts.from — start date
 * @param {Date} opts.to — end date (inclusive)
 * @returns {Array<{ date: string, slots: Array }>}
 */
export function generateSlotsInRange(opts) {
  const { from, to } = opts
  const result = []
  const cursor = new Date(from)
  cursor.setUTCHours(0, 0, 0, 0)

  const end = new Date(to)
  end.setUTCHours(0, 0, 0, 0)

  while (cursor <= end) {
    const dateStr = toISODate(cursor)
    const slots = generateSlots({ ...opts, date: new Date(cursor) })
    result.push({ date: dateStr, slots })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return result
}

// ── Formatting ──

/**
 * Format a Date to display string in a given timezone.
 * Falls back to UTC if no timezone provided.
 *
 * @param {Date} date
 * @param {string} [timezone] — IANA timezone, e.g. 'America/New_York'
 * @returns {string} e.g. "Monday, June 16, 2026"
 */
export function formatDate(date, timezone) {
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  if (timezone) opts.timeZone = timezone
  return date.toLocaleDateString('en-US', opts)
}

/**
 * Format a Date to a short date string.
 * @returns {string} e.g. "Jun 16, 2026"
 */
export function formatDateShort(date, timezone) {
  const opts = { year: 'numeric', month: 'short', day: 'numeric' }
  if (timezone) opts.timeZone = timezone
  return date.toLocaleDateString('en-US', opts)
}

/**
 * Format a Date to time string.
 * @returns {string} e.g. "10:30 AM"
 */
export function formatTime(date, timezone) {
  const opts = { hour: 'numeric', minute: '2-digit' }
  if (timezone) opts.timeZone = timezone
  return date.toLocaleTimeString('en-US', opts)
}

/**
 * Format a Date to ISO date string (YYYY-MM-DD).
 */
export function toISODate(date) {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ── Date Math ──

/**
 * Add minutes to a date, returning a new Date.
 */
export function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * MS_PER_MINUTE)
}

/**
 * Get all dates in a range (inclusive).
 * @returns {Date[]}
 */
export function getDatesInRange(start, end) {
  const dates = []
  const cursor = new Date(start)
  cursor.setUTCHours(0, 0, 0, 0)
  const endDate = new Date(end)
  endDate.setUTCHours(0, 0, 0, 0)

  while (cursor <= endDate) {
    dates.push(new Date(cursor))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return dates
}

// ── Overlap Detection ──

/**
 * Check if two time ranges overlap.
 * Each range: { start: Date, end: Date }
 */
export function isSlotOverlapping(a, b) {
  return a.start < b.end && b.start < a.end
}

/**
 * Filter out slots that overlap with busy intervals.
 * @param {Array} slots — slot objects with { start, end }
 * @param {Array} busyIntervals — busy periods with { start, end }
 * @returns {Array} free slots
 */
export function filterBusySlots(slots, busyIntervals) {
  return slots.filter(slot =>
    !busyIntervals.some(busy => isSlotOverlapping(slot, busy))
  )
}

// ── Grouping ──

/**
 * Group slots by ISO date string.
 * @returns {Object<string, Array>} e.g. { "2026-06-16": [{...}, ...], ... }
 */
export function groupSlotsByDate(slots) {
  const groups = {}
  for (const slot of slots) {
    const dateKey = toISODate(slot.start)
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(slot)
  }
  return groups
}

// ── Month Grid ──

/**
 * Build a 6×7 month calendar grid.
 * Each cell: { date: Date|null, iso: string|null, day: number|null, isCurrentMonth: bool }
 *
 * @param {number} year
 * @param {number} month — 1-based (1 = January)
 * @returns {Array<Array<Object>>} 6 rows × 7 columns
 */
export function getMonthGrid(year, month) {
  const firstDay = new Date(Date.UTC(year, month - 1, 1))
  const lastDay = new Date(Date.UTC(year, month, 0)) // last day of target month

  // Day of week for the 1st (0 = Sunday)
  const startDow = firstDay.getUTCDay()
  // Total days in this month
  const daysInMonth = lastDay.getUTCDate()

  const grid = []
  let dayCounter = 1
  // Previous month's trailing days
  const prevMonthLast = new Date(Date.UTC(year, month - 1, 0)).getUTCDate()

  for (let row = 0; row < 6; row++) {
    const week = []
    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col

      if (cellIndex < startDow) {
        // Previous month padding
        const d = prevMonthLast - startDow + cellIndex + 1
        const dt = new Date(Date.UTC(year, month - 2, d))
        week.push({ date: dt, iso: toISODate(dt), day: d, isCurrentMonth: false })
      } else if (dayCounter > daysInMonth) {
        // Next month padding
        const d = dayCounter - daysInMonth
        const dt = new Date(Date.UTC(year, month, d))
        week.push({ date: dt, iso: toISODate(dt), day: d, isCurrentMonth: false })
        dayCounter++
      } else {
        // Current month
        const dt = new Date(Date.UTC(year, month - 1, dayCounter))
        week.push({ date: dt, iso: toISODate(dt), day: dayCounter, isCurrentMonth: true })
        dayCounter++
      }
    }
    grid.push(week)
  }

  return grid
}

/**
 * Check if a given date is today in UTC.
 */
export function isToday(date) {
  const now = new Date()
  return toISODate(date) === toISODate(now)
}

/**
 * Parse ISO date string or Date to a UTC-midnight Date.
 */
export function parseDate(input) {
  if (input instanceof Date) {
    const d = new Date(input)
    d.setUTCHours(0, 0, 0, 0)
    return d
  }
  const d = new Date(input + 'T00:00:00Z')
  return d
}

/**
 * Get the difference in minutes between two Dates.
 */
export function diffMinutes(a, b) {
  return Math.round((a.getTime() - b.getTime()) / MS_PER_MINUTE)
}

/**
 * Format duration in minutes to a human-readable string.
 * @returns {string} e.g. "1h 30m" or "45m"
 */
export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
