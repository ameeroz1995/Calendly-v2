/**
 * calendar-connections.js — Calendar connections view.
 */

import { controller, html, esc } from '../controller.js'
import { skeletonCards } from '../components/skeleton-card.js'
import { statusDot } from '../components/status-dot.js'
import { icon } from '../utils/icons.js'

export function calendarConnectionsView({ state, fn }) {
    if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading data</div>
      <div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div>
      <button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button>
    </div>`
  }
  if (state.loading) return html`<div>${skeletonCards(2)}</div>`

  const connections = state.calendarConnections || []
  const maxReached = connections.filter(c => c.status === 'active').length >= 10

  return html`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div><h2>Calendar Connections</h2><p style="color:#8A8993;font-size:0.875rem;">Sync your availability across Google and Microsoft calendars</p></div>
      <button class="btn btn-primary btn-sm" onclick="${fn.connectCalendar}('google')" ${maxReached ? 'disabled' : ''}>${icon.plus} Connect Calendar</button>
    </div>

    ${state.calendarError ? html`<div class="card" style="margin-bottom:16px;border-color:#FF4A5A;"><p style="color:#FF4A5A;font-size:0.875rem;">${esc(state.calendarError)}</p></div>` : ''}

    ${connections.length === 0 ? html`
      <div class="empty-state">
        <div style="font-size:48px;margin-bottom:16px;">${icon.calendar}</div>
        <div class="empty-state-title">No calendars connected</div>
        <div class="empty-state-desc">Connect your Google or Microsoft calendar to sync availability.</div>
        <button class="btn btn-primary btn-sm" onclick="${fn.connectCalendar}('google')">+ Connect Google Calendar</button>
      </div>
    ` : ''}

    <div style="display:flex;flex-direction:column;gap:12px;">
      ${connections.map(conn => html`
        <div class="card fade-in" style="display:flex;align-items:center;gap:16px;">
          <div style="width:40px;height:40px;border-radius:10px;background:${conn.provider === 'google' ? '#fff' : '#0078D4'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.25rem;color:${conn.provider === 'google' ? '#4285F4' : '#fff'};flex-shrink:0;">
            ${conn.provider === 'google' ? 'G' : 'O'}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;">${esc(conn.email || 'Unknown')}</div>
            <div style="font-size:0.875rem;color:#8A8993;">${esc(conn.provider === 'google' ? 'Google Calendar' : 'Microsoft Outlook')} · ${conn.lastSync ? 'Synced ' + timeAgo(conn.lastSync) : 'Not synced'}</div>
          </div>
          ${statusDot(conn.status === 'active' ? 'green' : conn.status === 'error' ? 'red' : 'yellow')}
          <button class="btn btn-ghost btn-sm" onclick="${fn.syncCalendar}('${esc(conn.cid)}')">Sync</button>
          <button class="btn btn-ghost btn-sm" onclick="${fn.disconnectCalendar}('${esc(conn.cid)}')" style="color:#FF4A5A;">Disconnect</button>
        </div>
      `).join('')}
    </div>

    ${maxReached ? html`<p style="margin-top:12px;color:#F5A623;font-size:0.875rem;">Maximum 10 calendar connections reached.</p>` : ''}
  `
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
export function createCalendarConnections({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return calendarConnectionsView({ state, fn }) },
    state: {
      calendarConnections: [],
      calendarError: '',
      error: '',
      loading: false
    },
    methods: {
      connectCalendar(provider) {
        ctrl.render({ loading: true })
        import('../services/auth.service.js').then(({ getCurrentUser }) => {
          const user = getCurrentUser()
          if (user) {
            const connections = [...(ctrl.getState().calendarConnections || [])]
            const cid = 'cal_' + Math.random().toString(36).slice(2, 8)
            connections.push({
              cid, provider, email: user.email || 'unknown',
              status: 'active', lastSync: null, createdAt: new Date().toISOString(),
            })
            ctrl.render({ calendarConnections: connections, loading: false })
          }
        }).catch(() => ctrl.render({ loading: false }))
      },
      disconnectCalendar(cid) {
        const connections = (ctrl.getState().calendarConnections || []).filter(c => c.cid !== cid)
        ctrl.render({ calendarConnections: connections })
      },
      syncCalendar(cid) {
        const connections = (ctrl.getState().calendarConnections || []).map(c =>
          c.cid === cid ? { ...c, _syncing: true } : c
        )
        ctrl.render({ calendarConnections: connections })
        setTimeout(() => {
          const updated = (ctrl.getState().calendarConnections || []).map(c =>
            c.cid === cid ? { ...c, _syncing: false, lastSync: new Date().toISOString() } : c
          )
          ctrl.render({ calendarConnections: updated })
        }, 2000)
      }
    },
  })
  return ctrl
}
