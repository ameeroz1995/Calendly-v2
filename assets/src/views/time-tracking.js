/**
 * time-tracking.js — Time entries per workspace/team member.
 */

import { icon } from '../utils/icons.js'
import { controller, html, esc } from '../controller.js'
import { skeletonTable } from '../components/skeleton-table.js'
import { badge } from '../components/badge.js'

export function timeTrackingView({ state, fn }) {
  if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;"><div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div><div class="card-header" style="color:#FF4A5A;">Error loading time tracking</div><div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div><button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button></div>`
  }
  if (state.loading) return html`<div>${skeletonTable(5)}</div>`

  const entries = state.timeEntries || []
  const totals = state.timeTotals || { prep: 0, session: 0, followup: 0 }

  return html`
    <h2 style="margin-bottom:16px;">Time Tracking</h2>

    <div class="stat-grid" style="margin-bottom:16px;">
      <div class="stat-card"><div class="stat-card-label">Prep</div><div class="stat-card-value">${formatMin(totals.prep)}</div></div>
      <div class="stat-card"><div class="stat-card-label">Session</div><div class="stat-card-value">${formatMin(totals.session)}</div></div>
      <div class="stat-card"><div class="stat-card-label">Follow-up</div><div class="stat-card-value">${formatMin(totals.followup)}</div></div>
      <div class="stat-card"><div class="stat-card-label">Total</div><div class="stat-card-value">${formatMin(totals.prep + totals.session + totals.followup)}</div></div>
    </div>

    <div class="card">
      <div class="card-header">Time Entries</div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Workspace</th><th>Mode</th><th>Start</th><th>End</th><th>Duration</th></tr></thead>
          <tbody>
            ${entries.length === 0 ? html`<tr><td colspan="5" style="text-align:center;color:#8A8993;padding:24px;">No time entries yet</td></tr>` : ''}
            ${entries.map(e => html`
              <tr>
                <td>${esc(e.workspaceName || e.wid || '—')}</td>
                <td>${badge(e.mode === 'prep' ? 'info' : e.mode === 'session' ? 'success' : 'warning', e.mode || '—')}</td>
                <td>${esc(e.startTime ? new Date(e.startTime).toLocaleString() : '—')}</td>
                <td>${esc(e.endTime ? new Date(e.endTime).toLocaleString() : '—')}</td>
                <td>${formatMin(e.elapsedMin || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `
}

function formatMin(m) {
  if (!m || m === 0) return '0m'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const min = m % 60
  return min > 0 ? `${h}h ${min}m` : `${h}h`
}
export function createTimeTracking({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return timeTrackingView({ state, fn }) },
    state: {
      error: '',
      loading: false,
      timeEntries: [],
      timeTotals: {}
    },
    methods: {},
  })
  return ctrl
}
