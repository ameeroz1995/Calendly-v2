/**
 * audit.service.js — Immutable append-only audit logging.
 *
 * RTDB path: /audit_logs/{timestamp}_{random}
 * Each entry is immutable once written. Retention: 1 year.
 * Sensitive actions (create/delete event types, bookings, API key ops) are logged.
 *
 * Usage:
 *   import { logAudit, queryAuditLogs } from './services/audit.service.js'
 *   await logAudit('event_type.created', uid, { eid: 'evt_xxx' })
 *   const logs = await queryAuditLogs({ userId: uid, action: 'event_type.created', from: '2026-01-01', to: '2026-06-16' })
 */

import { AsyncResult } from '../utils/Result.js'
import { dbRef, dbWrite, dbRead, dbRemove } from '../db.js'
import { generateRandomHex } from '../utils/crypto.js'

/** Audit actions — centralized catalog for consistency */
export const AUDIT_ACTION = Object.freeze({
  // Auth
  USER_SIGNED_IN:    'auth.signed_in',
  USER_SIGNED_OUT:   'auth.signed_out',
  USER_CREATED:      'auth.user_created',
  USER_DELETED:      'auth.user_deleted',

  // Event Types
  EVENT_TYPE_CREATED: 'event_type.created',
  EVENT_TYPE_UPDATED: 'event_type.updated',
  EVENT_TYPE_DELETED: 'event_type.deleted',

  // Bookings
  BOOKING_CREATED:   'booking.created',
  BOOKING_CANCELLED: 'booking.cancelled',

  // Calendar
  CALENDAR_CONNECTED:    'calendar.connected',
  CALENDAR_DISCONNECTED: 'calendar.disconnected',

  // Routing
  ROUTING_FORM_CREATED: 'routing_form.created',
  ROUTING_FORM_UPDATED: 'routing_form.updated',
  POOL_CREATED:         'pool.created',
  POOL_MEMBER_ADDED:    'pool.member_added',
  POOL_MEMBER_REMOVED:  'pool.member_removed',

  // Workspace
  WORKSPACE_CREATED:    'workspace.created',
  TIMER_STARTED:        'timer.started',
  TIMER_STOPPED:        'timer.stopped',

  // API Keys
  API_KEY_GENERATED: 'api_key.generated',
  API_KEY_REVOKED:   'api_key.revoked',

  // Webhooks
  WEBHOOK_SUBSCRIBED:   'webhook.subscribed',
  WEBHOOK_UNSUBSCRIBED: 'webhook.unsubscribed',

  // Settings
  SETTINGS_UPDATED:  'settings.updated',
  BAA_SIGNED:        'compliance.baa_signed',
  BAA_REVOKED:       'compliance.baa_revoked',

  // Admin
  SSO_PROVIDER_ADDED:    'admin.sso_provider_added',
  DATA_RETENTION_PURGE:  'admin.data_retention_purge',
})

/**
 * Log an audit entry.
 *
 * @param {string} action — from AUDIT_ACTION
 * @param {string} userId — actor UID
 * @param {Object} details — { target?, oldValue?, newValue?, metadata? }
 * @returns {AsyncResult}
 */
export function logAudit(action, userId, details = {}) {
  return AsyncResult.from((async () => {
    const now = Date.now()
    const rand = generateRandomHex(4)
    const entryId = `${now}_${rand}`

    const entry = {
      entryId,
      action,
      userId,
      target: details.target || null,
      oldValue: details.oldValue || null,
      newValue: details.newValue || null,
      metadata: details.metadata || null,
      timestamp: now,
      iso: new Date(now).toISOString(),
    }

    await dbWrite(dbRef(`/audit_logs/${entryId}`), entry).unwrapOrThrow()
    return entryId
  })())
}

/**
 * Query audit logs with filters.
 *
 * @param {Object} filters
 * @param {string} [filters.userId] — filter by actor
 * @param {string} [filters.action] — filter by action type
 * @param {string} [filters.target] — filter by target entity ID
 * @param {string} [filters.from] — ISO datetime lower bound
 * @param {string} [filters.to] — ISO datetime upper bound
 * @param {number} [filters.limit=100] — max results
 * @returns {AsyncResult}
 */
export function queryAuditLogs(filters = {}) {
  return AsyncResult.from((async () => {
    const [all, err] = await dbRead(dbRef('/audit_logs')).unwrap()
    if (err) throw err
    if (!all) return []

    let results = Object.values(all)

    if (filters.userId) {
      results = results.filter(e => e.userId === filters.userId)
    }
    if (filters.action) {
      results = results.filter(e => e.action === filters.action)
    }
    if (filters.target) {
      results = results.filter(e => e.target === filters.target)
    }
    if (filters.from) {
      const fromMs = new Date(filters.from).getTime()
      results = results.filter(e => e.timestamp >= fromMs)
    }
    if (filters.to) {
      const toMs = new Date(filters.to).getTime()
      results = results.filter(e => e.timestamp <= toMs)
    }

    // Sort newest first
    results.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

    const limit = filters.limit || 100
    return results.slice(0, limit)
  })())
}

/**
 * Purge audit logs older than retention period.
 * Called by scheduled Cloud Function or admin action.
 *
 * @param {number} retentionDays — default 365 (1 year)
 * @returns {AsyncResult}
 */
export function purgeOldAuditLogs(retentionDays = 365) {
  return AsyncResult.from((async () => {
    const cutoff = Date.now() - retentionDays * 86400000
    const [all, err] = await dbRead(dbRef('/audit_logs')).unwrap()
    if (err) throw err
    if (!all) return 0

    const toDelete = Object.values(all).filter(e => (e.timestamp || 0) < cutoff)

    if (toDelete.length === 0) return 0

    // Firebase doesn't support batch deletes natively — use multi-path update
    for (const entry of toDelete) {
      await dbRemove(dbRef(`/audit_logs/${entry.entryId}`)).unwrapOrThrow()
    }

    console.log(`[audit] purged ${toDelete.length} entries older than ${retentionDays} days`)
    return toDelete.length
  })())
}
