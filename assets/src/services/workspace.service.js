/**
 * workspace.service.js — Client workspace management.
 *
 * Tasks, 3-mode timer (prep/session/follow-up), messages, time tracking.
 * Timer uses Date.now() delta, not interval counting.
 */

import { AsyncResult } from '../utils/Result.js'
import { dbRef, dbRead, dbWrite, dbUpdate, dbTransaction, dbRemove } from '../db.js'
import { generateRandomHex } from '../utils/crypto.js'

const TIMER_MODES = ['prep', 'session', 'followup']

/**
 * Create a workspace (called by booking service automatically).
 * @param {Object} data — { hostId, clientId, clientName, eventTypeId, bookingId }
 * @returns {AsyncResult}
 */
export function createWorkspace(data) {
  return AsyncResult.from((async () => {
    const wid = 'ws_' + generateRandomHex(6)
    const now = new Date().toISOString()
    const workspace = {
      wid, ...data,
      status: 'active',
      tasks: {},
      messages: {},
      timers: { current: null, log: {} },
      createdAt: now, updatedAt: now,
    }
    await dbWrite(dbRef(`/workspaces/${wid}`), workspace).unwrapOrThrow()
    return workspace
  })())
}

/**
 * Get a workspace by ID.
 * @param {string} wid
 * @returns {AsyncResult}
 */
export function getWorkspace(wid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/workspaces/${wid}`)).unwrap()
    if (err) throw err
    if (!data) throw new Error('Workspace not found')
    return data
  })())
}

/**
 * List workspaces for a host or client.
 * @param {string} userId
 * @param {string} [role='host'] — 'host' or 'client'
 * @returns {AsyncResult}
 */
export function listWorkspaces(userId, role = 'host') {
  return AsyncResult.from((async () => {
    const [all, err] = await dbRead(dbRef('/workspaces')).unwrap()
    if (err) throw err
    if (!all) return []
    const key = role === 'host' ? 'hostId' : 'clientId'
    return Object.values(all).filter(w => w[key] === userId)
  })())
}

// ── Tasks ──

/**
 * Add a task to a workspace.
 * @param {string} wid
 * @param {string} title — task description
 * @returns {AsyncResult}
 */
export function addTask(wid, title) {
  return AsyncResult.from((async () => {
    const tid = 'tsk_' + generateRandomHex(4)
    const now = new Date().toISOString()
    await dbUpdate(dbRef(`/workspaces/${wid}/tasks/${tid}`), {
      tid, title, completed: false, createdAt: now,
    }).unwrapOrThrow()
    return tid
  })())
}

/**
 * Toggle task completion.
 * @param {string} wid
 * @param {string} tid
 * @param {boolean} completed
 * @returns {AsyncResult}
 */
export function toggleTask(wid, tid) {
  return AsyncResult.from((async () => {
    const [result, err] = await dbTransaction(
      `/workspaces/${wid}/tasks/${tid}`,
      (current) => {
        if (!current) return undefined // abort — task doesn't exist
        return {
          ...current,
          completed: !current.completed,
          updatedAt: new Date().toISOString(),
        }
      }
    ).unwrap()
    if (err) throw err
    return result?.snapshot?.val()?.completed ?? null
  })())
}

/**
 * Delete a task.
 * @param {string} wid
 * @param {string} tid
 * @returns {AsyncResult}
 */
export function deleteTask(wid, tid) {
  return AsyncResult.from((async () => {
    await dbRemove(dbRef(`/workspaces/${wid}/tasks/${tid}`)).unwrapOrThrow()
    return true
  })())
}

// ── Timer ──

/**
 * Start a timer in a specific mode.
 * @param {string} wid
 * @param {string} mode — 'prep' | 'session' | 'followup'
 * @returns {AsyncResult}
 */
export function startTimer(wid, mode) {
  return AsyncResult.from((async () => {
    if (!TIMER_MODES.includes(mode)) throw new Error('Invalid timer mode: ' + mode)
    const now = Date.now()
    await dbUpdate(dbRef(`/workspaces/${wid}/timers/current`), {
      mode, startTime: now, running: true,
    }).unwrapOrThrow()
    return { mode, startTime: now }
  })())
}

/**
 * Stop the current timer and log the elapsed time.
 * @param {string} wid
 * @returns {AsyncResult}
 */
export function stopTimer(wid) {
  return AsyncResult.from((async () => {
    const [ws, wsErr] = await getWorkspace(wid).unwrap()
    if (wsErr) throw wsErr

    const current = (ws.timers && ws.timers.current) || {}
    if (!current.running) throw new Error('No timer running')

    const now = Date.now()
    const elapsedMs = now - current.startTime
    const elapsedMin = Math.round(elapsedMs / 60000)

    const lid = 'tml_' + generateRandomHex(4)
    const logEntry = {
      lid,
      mode: current.mode,
      startTime: current.startTime,
      endTime: now,
      elapsedMin,
    }

    // Log the entry
    await dbUpdate(dbRef(`/workspaces/${wid}/timers/log/${lid}`), logEntry).unwrapOrThrow()
    // Stop the current timer
    await dbUpdate(dbRef(`/workspaces/${wid}/timers/current`), {
      running: false, stoppedAt: now,
    }).unwrapOrThrow()

    return { elapsedMs, elapsedMin, logEntry }
  })())
}

/**
 * Get total elapsed time per mode for a workspace.
 * @param {string} wid
 * @returns {AsyncResult} resolving to { prep, session, followup } in minutes
 */
export function getElapsed(wid) {
  return AsyncResult.from((async () => {
    const [ws, wsErr] = await getWorkspace(wid).unwrap()
    if (wsErr) throw wsErr

    const logs = (ws.timers && ws.timers.log) ? Object.values(ws.timers.log) : []
    const totals = { prep: 0, session: 0, followup: 0 }
    for (const entry of logs) {
      if (totals.hasOwnProperty(entry.mode)) {
        totals[entry.mode] += entry.elapsedMin || 0
      }
    }

    // Include currently running timer if any
    const running = (ws.timers && ws.timers.current && ws.timers.current.running)
      ? ws.timers.current
      : null
    if (running) {
      const elapsedMin = Math.round((Date.now() - running.startTime) / 60000)
      if (totals.hasOwnProperty(running.mode)) {
        totals[running.mode] += elapsedMin
      }
    }

    return { totals, running: !!running }
  })())
}

// ── Messages ──

/**
 * Add a message to a workspace.
 * @param {string} wid
 * @param {string} senderId
 * @param {string} text
 * @returns {AsyncResult}
 */
export function addMessage(wid, senderId, text) {
  return AsyncResult.from((async () => {
    const mid = 'msg_' + generateRandomHex(6)
    const now = new Date().toISOString()
    await dbUpdate(dbRef(`/workspaces/${wid}/messages/${mid}`), {
      mid, senderId, text, createdAt: now,
    }).unwrapOrThrow()
    return mid
  })())
}

/**
 * Get all messages for a workspace.
 * @param {string} wid
 * @returns {AsyncResult}
 */
export function getMessages(wid) {
  return AsyncResult.from((async () => {
    const [ws, wsErr] = await getWorkspace(wid).unwrap()
    if (wsErr) throw wsErr
    const msgs = ws.messages ? Object.values(ws.messages) : []
    return msgs.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
  })())
}

/**
 * Check if a running timer has exceeded the warning threshold (7h) or limit (8h).
 * Returns an object describing the timer state for the client to display warnings.
 *
 * @param {string} wid — workspace ID
 * @returns {AsyncResult} resolving to { isRunning, elapsedMs, elapsedHours, isWarning, isOverLimit }
 */
export function checkTimerLimit(wid) {
  const WARNING_HOURS = 7
  const MAX_HOURS = 8

  return AsyncResult.from((async () => {
    const [ws, wsErr] = await getWorkspace(wid).unwrap()
    if (wsErr) throw wsErr
    if (!ws) throw new Error('Workspace not found')

    const current = ws.timers?.current
    if (!current || !current.running) {
      return { isRunning: false, elapsedMs: 0, elapsedHours: 0, isWarning: false, isOverLimit: false }
    }

    const elapsedMs = Date.now() - (current.startTime || Date.now())
    const elapsedHours = elapsedMs / 3600000
    const isWarning = elapsedHours >= WARNING_HOURS
    const isOverLimit = elapsedHours >= MAX_HOURS

    return {
      isRunning: true,
      elapsedMs,
      elapsedHours: Math.round(elapsedHours * 100) / 100,
      isWarning,
      isOverLimit,
      mode: current.mode || 'session',
    }
  })())
}
