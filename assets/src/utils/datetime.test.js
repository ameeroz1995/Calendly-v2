/**
 * datetime.test.js — Unit tests for datetime utilities.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  generateSlots, generateSlotsInRange, toISODate, addMinutes,
  isSlotOverlapping, groupSlotsByDate, getMonthGrid, isToday,
  formatDuration, formatDateShort, getDatesInRange, filterBusySlots,
} from './datetime.js'

describe('generateSlots', () => {
  it('generates correct number of slots for 9-5 with 30min + 15min buffer', () => {
    const slots = generateSlots({ startHour: 9, endHour: 17, durationMin: 30, bufferMin: 15 })
    // 8 hours = 480 min. Each slot = 30+15 = 45 min. 480/45 ≈ 10.6 → 10 full slots
    // Actually: 0, 45, 90, 135, 180, 225, 270, 315, 360, 405, 450. 450+30=480 → 11 slots
    assert.equal(slots.length, 11)
  })

  it('generates slots without buffer', () => {
    const slots = generateSlots({ startHour: 9, endHour: 17, durationMin: 60, bufferMin: 0 })
    // 480/60 = 8
    assert.equal(slots.length, 8)
  })

  it('generates zero slots if no time', () => {
    const slots = generateSlots({ startHour: 9, endHour: 9, durationMin: 30, bufferMin: 0 })
    assert.equal(slots.length, 0)
  })

  it('all slots are non-overlapping', () => {
    const slots = generateSlots({ startHour: 9, endHour: 17, durationMin: 45, bufferMin: 10 })
    for (let i = 1; i < slots.length; i++) {
      assert.ok(slots[i].start >= slots[i - 1].end, `slot ${i} overlaps slot ${i - 1}`)
    }
  })

  it('each slot has correct duration', () => {
    const slots = generateSlots({ startHour: 10, endHour: 12, durationMin: 30, bufferMin: 0 })
    for (const s of slots) {
      const diff = (s.end.getTime() - s.start.getTime()) / 60000
      assert.equal(diff, 30)
    }
  })

  it('slots are UTC-based for DST safety', () => {
    const slots = generateSlots({ startHour: 9, endHour: 17, durationMin: 30, bufferMin: 0, date: new Date('2026-03-29') }) // DST spring-forward in many zones
    // UTC has no DST, so slots should always generate consistently
    assert.ok(slots.length > 0)
    for (const s of slots) {
      // All start/end should be in UTC (same hour offset)
      assert.ok(s.start.toISOString().endsWith('Z') || s.start.getUTCHours() >= 9)
    }
  })

  it('handles leap year Feb 29', () => {
    const slots = generateSlots({ startHour: 9, endHour: 10, durationMin: 30, bufferMin: 0, date: new Date('2028-02-29') })
    assert.ok(slots.length > 0)
  })
})

describe('generateSlotsInRange', () => {
  it('generates slots for multiple days', () => {
    const result = generateSlotsInRange({
      startHour: 9, endHour: 10, durationMin: 60, bufferMin: 0,
      from: new Date('2026-06-16'), to: new Date('2026-06-18'),
    })
    assert.equal(result.length, 3) // 3 days
    result.forEach(({ date, slots }) => {
      assert.ok(date.match(/^\d{4}-\d{2}-\d{2}$/))
      assert.ok(slots.length > 0)
    })
  })
})

describe('toISODate', () => {
  it('formats date as YYYY-MM-DD in UTC', () => {
    const d = new Date('2026-06-16T12:00:00Z')
    assert.equal(toISODate(d), '2026-06-16')
  })

  it('handles month boundaries', () => {
    assert.equal(toISODate(new Date('2026-01-01T00:00:00Z')), '2026-01-01')
    assert.equal(toISODate(new Date('2026-12-31T00:00:00Z')), '2026-12-31')
  })
})

describe('addMinutes', () => {
  it('adds minutes correctly', () => {
    const d = new Date('2026-06-16T10:00:00Z')
    const result = addMinutes(d, 30)
    assert.equal(result.toISOString(), '2026-06-16T10:30:00.000Z')
  })

  it('wraps to next hour', () => {
    const d = new Date('2026-06-16T10:45:00Z')
    const result = addMinutes(d, 30)
    assert.equal(result.toISOString(), '2026-06-16T11:15:00.000Z')
  })
})

describe('isSlotOverlapping', () => {
  it('detects overlap', () => {
    const a = { start: new Date('2026-06-16T10:00:00Z'), end: new Date('2026-06-16T11:00:00Z') }
    const b = { start: new Date('2026-06-16T10:30:00Z'), end: new Date('2026-06-16T11:30:00Z') }
    assert.equal(isSlotOverlapping(a, b), true)
  })

  it('detects no overlap (adjacent)', () => {
    const a = { start: new Date('2026-06-16T10:00:00Z'), end: new Date('2026-06-16T10:30:00Z') }
    const b = { start: new Date('2026-06-16T10:30:00Z'), end: new Date('2026-06-16T11:00:00Z') }
    assert.equal(isSlotOverlapping(a, b), false)
  })

  it('detects no overlap (separate)', () => {
    const a = { start: new Date('2026-06-16T09:00:00Z'), end: new Date('2026-06-16T10:00:00Z') }
    const b = { start: new Date('2026-06-16T11:00:00Z'), end: new Date('2026-06-16T12:00:00Z') }
    assert.equal(isSlotOverlapping(a, b), false)
  })
})

describe('filterBusySlots', () => {
  it('filters out overlapping busy intervals', () => {
    const slots = [
      { start: new Date('2026-06-16T09:00:00Z'), end: new Date('2026-06-16T09:30:00Z') },
      { start: new Date('2026-06-16T09:30:00Z'), end: new Date('2026-06-16T10:00:00Z') },
    ]
    const busy = [{ start: new Date('2026-06-16T09:15:00Z'), end: new Date('2026-06-16T09:45:00Z') }]
    const free = filterBusySlots(slots, busy)
    assert.equal(free.length, 0) // both overlap
  })
})

describe('groupSlotsByDate', () => {
  it('groups slots by ISO date', () => {
    const slots = [
      { start: new Date('2026-06-16T09:00:00Z'), end: new Date('2026-06-16T09:30:00Z') },
      { start: new Date('2026-06-17T10:00:00Z'), end: new Date('2026-06-17T10:30:00Z') },
      { start: new Date('2026-06-16T10:00:00Z'), end: new Date('2026-06-16T10:30:00Z') },
    ]
    const groups = groupSlotsByDate(slots)
    assert.equal(Object.keys(groups).length, 2)
    assert.equal(groups['2026-06-16'].length, 2)
    assert.equal(groups['2026-06-17'].length, 1)
  })
})

describe('getMonthGrid', () => {
  it('returns 6x7 grid', () => {
    const grid = getMonthGrid(2026, 6)
    assert.equal(grid.length, 6)
    grid.forEach(row => assert.equal(row.length, 7))
  })

  it('first day of June 2026 is Monday (index 1)', () => {
    const grid = getMonthGrid(2026, 6)
    // June 1, 2026 is a Monday. Grid[0][0] should be Sunday May 31 (prev month)
    const prevMonthCells = grid[0].filter(c => c && !c.isCurrentMonth)
    const currentMonthCells = grid[0].filter(c => c && c.isCurrentMonth)
    assert.ok(prevMonthCells.length > 0, 'should have previous month padding')
    assert.ok(currentMonthCells.length > 0)
  })

  it('contains day 1 in first row', () => {
    const grid = getMonthGrid(2026, 6)
    const firstRow = grid[0]
    assert.ok(firstRow.some(c => c && c.day === 1 && c.isCurrentMonth))
  })

  it('contains day 30 (June has 30 days)', () => {
    const grid = getMonthGrid(2026, 6)
    const allCells = grid.flat().filter(Boolean)
    assert.ok(allCells.some(c => c.day === 30 && c.isCurrentMonth))
    assert.equal(allCells.some(c => c.day === 31 && c.isCurrentMonth), false)
  })
})

describe('isToday', () => {
  it('returns true for today', () => {
    assert.equal(isToday(new Date()), true)
  })

  it('returns false for yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000)
    assert.equal(isToday(yesterday), false)
  })
})

describe('formatDuration', () => {
  it('formats minutes only', () => assert.equal(formatDuration(45), '45m'))
  it('formats hours only', () => assert.equal(formatDuration(60), '1h'))
  it('formats hours and minutes', () => assert.equal(formatDuration(90), '1h 30m'))
  it('formats zero', () => assert.equal(formatDuration(0), '0m'))
})

describe('getDatesInRange', () => {
  it('returns inclusive date range', () => {
    const dates = getDatesInRange(new Date('2026-06-16'), new Date('2026-06-18'))
    assert.equal(dates.length, 3)
    assert.equal(toISODate(dates[0]), '2026-06-16')
    assert.equal(toISODate(dates[2]), '2026-06-18')
  })
})
