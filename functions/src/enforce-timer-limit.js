/**
 * enforce-timer-limit.js — Timer auto-stop enforcement.
 *
 * Two triggers:
 * 1. onValueWritten — fires on timer start (immediate check).
 * 2. onSchedule — periodic sweep every 5min to catch timers that
 *    exceed limits without a re-write to startTime.
 *
 * Auto-stops at 8h. Warning at 7h. Hard cap at 12h.
 * Idempotent: won't double-stop an already stopped timer.
 */

import { onValueWritten } from 'firebase-functions/v2/database'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getDatabase } from 'firebase-admin/database'
import { initializeApp } from 'firebase-admin/app'

initializeApp()

const MAX_TIMER_HOURS = 8
const WARNING_HOURS = 7
const HARD_CAP_HOURS = 12
const MS_PER_HOUR = 3600000

/**
 * Immediate check when a timer's startTime is written.
 */
export const enforcetimerlimit = onValueWritten(
  { ref: '/workspaces/{wid}/timers/current/startTime', region: 'us-central1' },
  async (event) => {
    const wid = event.params.wid
    const startTime = event.data.after.val()

    if (!startTime) return

    const db = getDatabase()
    await checkTimer(db, wid, startTime)
  }
)

/**
 * Periodic sweep — runs every 5 minutes to catch any running timers
 * that have exceeded limits without a re-write to startTime.
 */
export const enforcetimerlimitsweep = onSchedule(
  { schedule: '*/5 * * * *', region: 'us-central1' },
  async () => {
    const db = getDatabase()
    const now = Date.now()

    // Read all workspaces in one query and filter client-side
    const workspacesSnap = await db.ref('/workspaces').get()
    const workspaces = workspacesSnap.val() || {}

    const checks = []

    for (const [wid, ws] of Object.entries(workspaces)) {
      const current = ws?.timers?.current
      if (!current || !current.running || !current.startTime) continue

      const elapsedMs = now - current.startTime
      const elapsedHours = elapsedMs / MS_PER_HOUR

      if (elapsedHours >= WARNING_HOURS) {
        checks.push(checkTimer(db, wid, current.startTime))
      }
    }

    if (checks.length > 0) {
      await Promise.allSettled(checks)
      console.log(`[timer] periodic sweep checked ${checks.length} running timers`)
    }
  }
)

/**
 * Check a single timer and enforce limits.
 * Idempotent: reads current state before acting to prevent double-stop.
 */
async function checkTimer(db, wid, startTime) {
  const now = Date.now()
  const elapsedMs = now - startTime
  const elapsedHours = elapsedMs / MS_PER_HOUR

  console.log(`[timer] workspace ${wid} timer running for ${elapsedHours.toFixed(1)}h`)

  const timerRef = db.ref(`/workspaces/${wid}/timers/current`)

  // Read current state for idempotency guard
  const currentSnap = await timerRef.get()
  const current = currentSnap.val() || {}
  if (!current.running) {
    console.log(`[timer] workspace ${wid} already stopped — skipping`)
    return
  }

  if (elapsedHours >= HARD_CAP_HOURS) {
    await stopTimer(db, wid, timerRef, current, now, 'Hard cap (12h) exceeded')
  } else if (elapsedHours >= MAX_TIMER_HOURS) {
    await stopTimer(db, wid, timerRef, current, now, 'Auto-stopped after 8h')
  } else if (elapsedHours >= WARNING_HOURS) {
    await sendWarning(db, wid, current)
  }
}

/**
 * Stop the timer and log the billing entry.
 */
async function stopTimer(db, wid, timerRef, current, now, reason) {
  const elapsedMs = now - current.startTime
  const elapsedMin = Math.round(elapsedMs / 60000)

  const lid = 'tml_' + Date.now().toString(36)
  const logEntry = {
    lid,
    mode: current.mode || 'session',
    startTime: current.startTime,
    endTime: now,
    elapsedMin,
    autoStopped: true,
    autoStopReason: reason,
  }

  await db.ref(`/workspaces/${wid}/timers/log/${lid}`).set(logEntry)
  await timerRef.update({ running: false, stoppedAt: now, stoppedBy: 'server' })

  console.log(`[timer] workspace ${wid} auto-stopped: ${reason} (${elapsedMin}min)`)
}

/**
 * Send a warning notification to the host.
 */
async function sendWarning(db, wid, current) {
  const wsSnap = await db.ref(`/workspaces/${wid}`).get()
  const ws = wsSnap.val() || {}
  const hostId = ws.hostId
  if (!hostId) return

  try {
    await db.ref(`/notifications`).push({
      type: 'timer_warning',
      hostId,
      workspaceId: wid,
      mode: current.mode,
      elapsedHours: WARNING_HOURS,
      message: `Your timer in workspace ${wid} has been running for ${WARNING_HOURS} hours. It will auto-stop at ${MAX_TIMER_HOURS} hours.`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    })
    console.log(`[timer] warning sent to host ${hostId} for workspace ${wid}`)
  } catch (e) {
    console.error(`[timer] failed to send warning for ${wid}:`, e.message)
  }
}
