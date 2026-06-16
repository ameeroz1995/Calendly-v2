/**
 * contacts.js — Contacts/CRM list view (Phase 7).
 */

import { controller, html, esc } from '../controller.js'
import { dbRef, dbRead } from '../db.js'
import { icon } from '../utils/icons.js'
import { skeletonCards } from '../components/skeleton-card.js'
import { badge } from '../components/badge.js'

export function contactsView({ state, fn }) {
    if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading data</div>
      <div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div>
      <button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button>
    </div>`
  }
  if (state.loading) return html`<div>${skeletonCards(4)}</div>`

  const contacts = state.contacts || []
  const search = state.contactSearch || ''

  return html`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div><h2>Contacts</h2><p style="color:#8A8993;font-size:0.875rem;">${contacts.length} contact${contacts.length !== 1 ? 's' : ''}</p></div>
      <button class="btn btn-primary btn-sm" onclick="${fn.showCreateContact}()">+ Add Contact</button>
    </div>

    <div style="margin-bottom:16px;max-width:360px;">
      <div style="position:relative;">
        <input class="input" type="text" placeholder="Search contacts..." value="${esc(search)}" oninput="${fn.searchContacts}()" style="padding-left:36px;">
        <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8A8993;pointer-events:none;" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      </div>
    </div>

    ${contacts.length === 0 ? html`
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <div class="empty-state-title">No contacts</div>
        <div class="empty-state-desc">Contacts are created automatically when someone books with you, or you can add them manually.</div>
      </div>
    ` : ''}

    <div style="display:flex;flex-direction:column;gap:8px;">
      ${contacts.map(c => html`
        <div class="card fade-in" style="display:flex;align-items:center;gap:16px;cursor:pointer;" onclick="${fn.navigateTo}('/contacts/${esc(c.cid)}')">
          <div class="sidebar-user-avatar" style="width:40px;height:40px;font-size:14px;">${esc(getInitials(c.name))}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;">${esc(c.name)}</div>
            <div style="font-size:0.875rem;color:#8A8993;">${esc(c.email || 'No email')}${c.company ? ' · ' + esc(c.company) : ''}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.875rem;">${c.totalBookings || 0} bookings</div>
            ${c.lastBooking ? html`<div style="font-size:0.75rem;color:#8A8993;">Last: ${esc(new Date(c.lastBooking).toLocaleDateString())}</div>` : ''}
          </div>
          ${(c.lists || []).map(l => badge('neutral', l)).join('')}
        </div>
      `).join('')}
    </div>
  `
}

function getInitials(name) {
  if (!name) return '?'
  const parts = String(name).trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
export function createContacts({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return contactsView({ state, fn }) },
    state: {
      contactSearch: '',
      contacts: [],
      error: '',
      loading: true
    },
    methods: {
      searchContacts() {
        const input = document.querySelector('input[placeholder*="Search contacts"]')
        const query = input?.value || ''
        ctrl.render({ contactSearch: query })},
      showCreateContact() {ctrl.render({ showCreateContact: true })}
    },
  })
    ctrl.load = async function () {
    const uid = ctrl.getState().user?.uid
    if (!uid) { ctrl.render({ loading: true }); return }
    try {
      const [bookingsSnap, bErr] = await dbRead(dbRef('/bookings')).unwrap()
      if (bErr) throw bErr
      const bookings = bookingsSnap ? Object.values(bookingsSnap).filter(b => b.hostId === uid) : []
      // Extract unique contacts from bookings
      const contactMap = new Map()
      for (const b of bookings) {
        const cid = b.inviteeId || b.formData?.email || 'anonymous'
        if (!contactMap.has(cid)) {
          contactMap.set(cid, {
            cid,
            name: b.formData?.name || cid,
            email: b.formData?.email || '',
            totalBookings: 0,
            lastBooking: b.createdAt || '',
          })
        }
        const c = contactMap.get(cid)
        c.totalBookings++
        if (b.createdAt > c.lastBooking) c.lastBooking = b.createdAt
      }
      const contacts = [...contactMap.values()].sort((a, b) => b.lastBooking.localeCompare(a.lastBooking))
      ctrl.render({ contacts, loading: true, error: '' })
    } catch (e) {
      console.error('[contacts] load error:', e)
      ctrl.render({ loading: true, error: e.message || 'Failed to load contacts' })
    }
  }
  return ctrl
}
