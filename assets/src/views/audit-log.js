/**
 * audit-log.js — Audit log viewer (Phase 7).
 * Route: /audit-log
 */

import { controller, html, esc } from '../controller.js'
import { icon } from '../utils/icons.js'
import { badge } from '../components/badge.js'
import { skeletonTable } from '../components/skeleton-table.js'

export function auditLogView({ state, fn }) {
    if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading data</div>
      <div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div>
      <button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button>
    </div>`
  }
  if (state.loading) return html`<div>${skeletonTable(10)}</div>`

  const entries = state.auditEntries || []
  const filters = state.auditFilters || {}

  return html`
    <h2 style="margin-bottom:16px;">Audit Log</h2>

    <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
      <input class="input" placeholder="Filter by user ID..." value="${esc(filters.userId || '')}" style="max-width:200px;">
      <select class="select" style="max-width:200px;">
        <option value="">All Actions</option>
        <option value="booking.created">Booking Created</option>
        <option value="booking.cancelled">Booking Cancelled</option>
        <option value="event_type.created">Event Type Created</option>
        <option value="event_type.deleted">Event Type Deleted</option>
        <option value="api_key.generated">API Key Generated</option>
        <option value="api_key.revoked">API Key Revoked</option>
        <option value="auth.signed_in">User Signed In</option>
        <option value="settings.updated">Settings Updated</option>
      </select>
      <input class="input" type="date" value="${esc(filters.from || '')}" style="max-width:160px;">
      <span style="color:#8A8993;align-self:center;">to</span>
      <input class="input" type="date" value="${esc(filters.to || '')}" style="max-width:160px;">
      <button class="btn btn-primary btn-sm">Filter</button>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Timestamp</th><th>Action</th><th>User</th><th>Target</th><th>Details</th></tr></thead>
          <tbody>
            ${entries.length === 0 ? html`<tr><td colspan="5" style="text-align:center;color:#8A8993;padding:24px;">No audit entries found</td></tr>` : ''}
            ${entries.map(e => html`
              <tr>
                <td style="font-size:0.75rem;white-space:nowrap;">${esc(e.iso || '—')}</td>
                <td>${badge(actionBadge(e.action), e.action || '—')}</td>
                <td style="font-family:monospace;font-size:0.75rem;">${esc((e.userId || '').slice(0, 12) + '...')}</td>
                <td style="font-family:monospace;font-size:0.75rem;">${esc(e.target ? e.target.slice(0, 16) + '...' : '—')}</td>
                <td style="font-size:0.75rem;color:#8A8993;">${esc(formatDetails(e))}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

function actionBadge(action) {
  if (!action) return 'neutral'
  if (action.startsWith('auth.')) return 'info'
  if (action.startsWith('booking.')) return 'success'
  if (action.startsWith('event_type.')) return 'warning'
  if (action.startsWith('api_key.')) return 'danger'
  if (action.startsWith('admin.')) return 'danger'
  return 'neutral'
}

function formatDetails(entry) {
  const parts = []
  if (entry.oldValue) parts.push(`old: ${JSON.stringify(entry.oldValue).slice(0, 40)}`)
  if (entry.newValue) parts.push(`new: ${JSON.stringify(entry.newValue).slice(0, 40)}`)
  return parts.join(' → ') || '—'
}
export function createAuditLog({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return auditLogView({ state, fn }) },
    state: {
      auditEntries: [],
      auditFilters: {},
      error: '',
      loading: false
    },
    methods: {},
  })
  return ctrl
}
