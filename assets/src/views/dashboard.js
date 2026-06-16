/**
 * dashboard.js — Dashboard home page.
 *
 * States: loading | loaded | empty | error
 * KPI cards, recent bookings table, quick action buttons.
 */

import { controller, html, esc } from '../controller.js'
import { icon } from '../utils/icons.js'
import { skeletonCards } from '../components/skeleton-card.js'
import { badge } from '../components/badge.js'
import { dbRef, dbRead } from '../db.js'

export function dashboardView({ state, fn }) {
  // ── Error ────────────────────────────────────────────────────
  if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading dashboard</div>
      <div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div>
      <button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button>
    </div>`
  }

  // ── Loading ──────────────────────────────────────────────────
  if (state.loading) return html`<div>${skeletonCards(4)}</div>`

  const d = state.dashboard || {}
  const bookingsToday = d.bookingsToday ?? 0
  const pendingCount = d.pendingCount ?? 0
  const activeWorkspaces = d.activeWorkspaces ?? 0
  const recentBookings = d.recentBookings || []
  const noShowRate = d.noShowRate
  const newWorkspacesThisWeek = d.newWorkspacesThisWeek ?? 0

  return html`
    <div class="fade-in">
      <!-- KPI Cards -->
      <div class="stat-grid">
        <div class="stat-card fade-in">
          <div class="stat-card-label">Bookings Today</div>
          <div class="stat-card-value">${bookingsToday}</div>
        </div>
        <div class="stat-card fade-in" style="animation-delay:50ms;">
          <div class="stat-card-label">Pending</div>
          <div class="stat-card-value">${pendingCount}</div>
          <div class="stat-card-change" style="color:#F5A623;">Requires review</div>
        </div>
        <div class="stat-card fade-in" style="animation-delay:100ms;">
          <div class="stat-card-label">Active Workspaces</div>
          <div class="stat-card-value">${activeWorkspaces}</div>
          ${newWorkspacesThisWeek > 0 ? html`<div class="stat-card-change" style="color:#8A8993;">${newWorkspacesThisWeek} created this week</div>` : ''}
        </div>
        <div class="stat-card fade-in" style="animation-delay:150ms;">
          <div class="stat-card-label">No-Show Rate</div>
          <div class="stat-card-value" style="color:#00C48C;">${noShowRate != null ? esc(String(noShowRate)) + '%' : '—'}</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" onclick="${fn.navigateTo}('/event-types')">+ New Event Type</button>
        <button class="btn btn-ghost btn-sm" onclick="${fn.navigateTo}('/availability')">Manage Availability</button>
      </div>

      <!-- Recent Bookings -->
      <div class="card fade-in" style="animation-delay:200ms;">
        <div class="card-header">Recent Bookings</div>
        ${recentBookings.length === 0 ? html`
          <div style="text-align:center;padding:32px;color:#8A8993;">
            No bookings yet. Share your booking link to get started.
          </div>
        ` : html`
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Invitee</th><th>Event</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                ${recentBookings.map(b => html`
                  <tr>
                    <td>${esc(b.formData?.name || b.inviteeId)}</td>
                    <td>${esc(b.eventTypeId)}</td>
                    <td>${esc(b.date || '—')}</td>
                    <td>${esc(b.slotId || '—')}</td>
                    <td>${badge(b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'warning', b.status || 'pending')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `
}
export function createDashboard({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return dashboardView({ state, fn }) },
    state: {
      dashboard: {},
      error: '',
      loading: true
    },
    methods: {},
  })

  ctrl.load = async function () {
    const state = ctrl.getState()
    const uid = state.user?.uid
    if (!uid) {
      ctrl.render({ loading: false })
      return
    }

    try {
      // Read bookings index for this host
      const [bookingsIdx, idxErr] = await dbRead(dbRef(`/host_bookings/${uid}`)).unwrap()
      if (idxErr) throw idxErr

      const bookingIds = bookingsIdx ? Object.keys(bookingsIdx) : []
      const bookings = []
      for (const bid of bookingIds.slice(0, 50)) {
        const [b, bErr] = await dbRead(dbRef(`/bookings/${bid}`)).unwrap()
        if (!bErr && b) bookings.push(b)
      }

      // Read workspaces
      const [workspacesSnap, wsErr] = await dbRead(dbRef('/workspaces')).unwrap()
      const allWorkspaces = workspacesSnap ? Object.values(workspacesSnap).filter(w => w.hostId === uid) : []

      // Compute stats
      const today = new Date().toISOString().slice(0, 10)
      const bookingsToday = bookings.filter(b => (b.createdAt || '').startsWith(today)).length
      const pendingCount = bookings.filter(b => b.status === 'pending').length
      const activeWorkspaces = allWorkspaces.filter(w => w.status === 'active').length

      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const newWorkspacesThisWeek = allWorkspaces.filter(w =>
        new Date(w.createdAt || 0) >= weekStart
      ).length

      const recentBookings = bookings
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        .slice(0, 5)

      const totalWithStatus = bookings.filter(b => b.status === 'confirmed' || b.status === 'cancelled' || b.status === 'no_show')
      const noShows = bookings.filter(b => b.status === 'no_show').length
      const noShowRate = totalWithStatus.length > 0 ? Math.round((noShows / totalWithStatus.length) * 100) : null

      ctrl.render({
        loading: false,
        error: '',
        dashboard: {
          bookingsToday,
          pendingCount,
          activeWorkspaces,
          newWorkspacesThisWeek,
          noShowRate,
          recentBookings,
        },
      })
    } catch (e) {
      console.error('[dashboard] load error:', e)
      ctrl.render({ loading: false, error: e.message || 'Failed to load dashboard' })
    }
  }

  return ctrl
}
