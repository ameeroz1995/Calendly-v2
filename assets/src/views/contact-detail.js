/**
 * contact-detail.js — Single contact detail view (Phase 7).
 * Route: /contacts/:id
 */

import { controller, html, esc } from '../controller.js'
import { icon } from '../utils/icons.js'
import { badge } from '../components/badge.js'

export function contactDetailView({ state, fn }) {
    if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading data</div>
      <div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div>
      <button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button>
    </div>`
  }
  if (state.loading) {
    return html`<div style="text-align:center;padding:48px;color:#8A8993;">Loading contact...</div>`
  }

  const contact = state.activeContact || {}
  const notes = state.contactNotes || []
  const bookingHistory = state.contactBookings || []

  return html`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <button class="btn btn-ghost btn-sm" onclick="${fn.navigateTo}('/contacts')">← Back</button>
      <div class="sidebar-user-avatar" style="width:48px;height:48px;font-size:18px;">${esc(getInitials(contact.name))}</div>
      <div>
        <h2>${esc(contact.name || 'Unknown')}</h2>
        <p style="color:#8A8993;font-size:0.875rem;">${esc(contact.email || 'No email')}${contact.company ? ' · ' + esc(contact.company) : ''}</p>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <!-- Details -->
      <div class="card">
        <div class="card-header">Details</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;"><span style="color:#8A8993;">Name</span><span>${esc(contact.name || '—')}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:#8A8993;">Email</span><span>${esc(contact.email || '—')}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:#8A8993;">Phone</span><span>${esc(contact.phone || '—')}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:#8A8993;">Company</span><span>${esc(contact.company || '—')}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:#8A8993;">Total Bookings</span><span>${contact.totalBookings || 0}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:#8A8993;">No-Shows</span><span>${contact.noShowCount || 0}</span></div>
        </div>
        ${(contact.lists || []).length > 0 ? html`<div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;">${contact.lists.map(l => badge('info', l)).join('')}</div>` : ''}
      </div>

      <!-- Notes -->
      <div class="card">
        <div class="card-header">Notes</div>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:200px;overflow-y:auto;margin-bottom:8px;">
          ${notes.map(n => html`
            <div style="background:#1A1923;padding:8px;border-radius:8px;font-size:0.875rem;">
              <div style="color:#8A8993;font-size:0.75rem;margin-bottom:4px;">${esc(n.createdAt ? new Date(n.createdAt).toLocaleString() : '')}</div>
              ${esc(n.text)}
            </div>
          `).join('')}
          ${notes.length === 0 ? html`<div style="color:#8A8993;text-align:center;padding:16px;">No notes</div>` : ''}
        </div>
        <div style="display:flex;gap:8px;">
          <input id="ct-note-input" class="input" placeholder="Add note..." style="font-size:0.875rem;">
          <button class="btn btn-primary btn-sm" onclick="${fn.addNote}()">Add</button>
        </div>
      </div>

      <!-- Booking History -->
      <div class="card" style="grid-column:1/-1;">
        <div class="card-header">Booking History</div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Date</th><th>Event Type</th><th>Status</th></tr></thead>
            <tbody>
              ${bookingHistory.length === 0 ? html`<tr><td colspan="3" style="text-align:center;color:#8A8993;padding:16px;">No bookings yet</td></tr>` : ''}
              ${bookingHistory.map(b => html`
                <tr>
                  <td>${esc(b.date || '—')}</td>
                  <td>${esc(b.eventTypeId || '—')}</td>
                  <td>${badge(b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'warning', b.status || '—')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
}

function getInitials(name) {
  if (!name) return '?'
  const parts = String(name).trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
export function createContactDetail({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return contactDetailView({ state, fn }) },
    state: {
      activeContact: {},
      contactBookings: [],
      contactNotes: [],
      error: '',
      loading: false
    },
    methods: {
      addNote() {
        const input = ctrl.$('contact-note-input')
        if (!input) return
        const text = input.value.trim()
        if (!text) return
        input.value = ''
        const nid = 'nte_' + Math.random().toString(36).slice(2, 6)
        const note = { nid, text, createdAt: new Date().toISOString() }
        const contact = { ...ctrl.getState().activeContact }
        const notes = [...(contact.notes || []), note]
        contact.notes = notes
        ctrl.render({ activeContact: contact, contactNotes: notes })}
    },
  })
  return ctrl
}
