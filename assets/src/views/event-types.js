/**
 * event-types.js — Event Types list view.
 *
 * States: loading | loaded | empty | creating | editing | error
 */

import { controller, html, esc } from '../controller.js'
import { skeletonCards } from '../components/skeleton-card.js'
import { badge } from '../components/badge.js'
import { icon } from '../utils/icons.js'
import { SearchInput } from '../components/search-input.js'
import { dbRef, dbRead, dbWrite, dbUpdate, dbRemove } from '../db.js'

const MAX_FREE_EVENT_TYPES = 1

export function eventTypesView({ state, fn }) {
  // ── Loading ──────────────────────────────────────────────────
  if (state.loading) return html`<div>${skeletonCards(4)}</div>`

  // ── Error ────────────────────────────────────────────────────
  if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading event types</div>
      <div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div>
      <button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button>
    </div>`
  }

  const eventTypes = state.eventTypes || []
  const searchQuery = (state.eventTypeSearch || '').toLowerCase()
  const showForm = state.showCreateForm
  const editingId = state.editingId
  const user = state.user || {}
  const isFreeTier = user.plan === 'free'
  const activeCount = eventTypes.filter(e => e.active !== false).length
  const atFreeLimit = isFreeTier && activeCount >= MAX_FREE_EVENT_TYPES

  // Client-side search filter
  const filtered = searchQuery
    ? eventTypes.filter(et => et.title?.toLowerCase().includes(searchQuery))
    : eventTypes

  // ── Empty state ──────────────────────────────────────────────
  if (!showForm && eventTypes.length === 0) {
    return html`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div><h2>Event Types</h2><p style="color:#8A8993;font-size:0.875rem;">Create event types for people to book time with you</p></div>
        <button class="btn btn-primary btn-sm" onclick="${fn.showCreateForm}()">${icon.plus} New</button>
      </div>
      <div class="empty-state">
        <div style="font-size:48px;margin-bottom:16px;">${icon.calendar}</div>
        <div class="empty-state-title">No event types</div>
        <div class="empty-state-desc">Create your first event type to start accepting bookings.</div>
        <button class="btn btn-primary btn-sm" onclick="${fn.showCreateForm}()">${icon.plus} Create Event Type</button>
      </div>
    `
  }

  // ── Main view ────────────────────────────────────────────────
  return html`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
      <div>
        <h2>Event Types</h2>
        <p style="color:#8A8993;font-size:0.875rem;">${eventTypes.length} event type${eventTypes.length !== 1 ? 's' : ''} · ${activeCount} active</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <div style="position:relative;width:200px;">
          <input class="input" placeholder="Search..." value="${esc(searchQuery || '')}" oninput="${fn._searchEventTypes}()" style="padding-left:32px;">
          <span style="position:absolute;left:8px;top:50%;transform:translateY(-50%);color:#8A8993;">${icon.search}</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="${fn.showCreateForm}()"
          ${atFreeLimit ? 'disabled' : ''}
          title="${atFreeLimit ? 'Free tier limited to ' + MAX_FREE_EVENT_TYPES + ' event type' : ''}">${icon.plus} New</button>
      </div>
    </div>

    ${atFreeLimit ? html`<div class="card" style="border-left:3px solid #F5A623;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      <span style="color:#F5A623;">${icon.alert}</span>
      <span style="color:#F4F3F6;font-size:0.875rem;">Free tier limit reached (${MAX_FREE_EVENT_TYPES} event type). Upgrade to create more.</span>
    </div>` : ''}

    ${showForm ? renderCreateForm(state, fn) : ''}
    ${editingId ? renderEditForm(state, fn, editingId) : ''}

    ${filtered.length === 0 && searchQuery ? html`
      <div class="empty-state">
        <div style="font-size:32px;margin-bottom:8px;">${icon.search}</div>
        <div class="empty-state-title">No results for "${esc(searchQuery)}"</div>
        <div class="empty-state-desc">Try a different search term.</div>
      </div>
    ` : ''}

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">
      ${filtered.map(et => html`
        <div class="card fade-in" style="cursor:pointer;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span class="status-dot status-dot-${et.active ? 'green' : 'gray'}"></span>
            <span style="font-weight:600;">${esc(et.title)}</span>
          </div>
          <div style="font-size:0.875rem;color:#8A8993;display:flex;gap:16px;">
            <span>${icon.clock} ${esc(String(et.duration))}m</span>
            <span>${icon.link} ${esc(et.location || 'none')}</span>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;align-items:center;">
            ${badge(et.active ? 'info' : 'neutral', et.active ? 'Active' : 'Inactive')}
            ${et.visibility === 'hidden' ? badge('neutral', 'Hidden') : ''}
            <span style="flex:1;"></span>
            <button class="btn btn-ghost btn-sm" onclick="${fn.editEventType}('${esc(et.eid)}')" style="font-size:0.75rem;min-height:32px;">Edit</button>
            <a class="btn btn-ghost btn-sm" href="#/event-types/editor" style="font-size:0.75rem;min-height:32px;">Page</a>
            <button class="btn btn-ghost btn-sm" onclick="${fn.deleteEventType}('${esc(et.eid)}')" style="color:#FF4A5A;font-size:0.75rem;min-height:32px;">Delete</button>
          </div>
        </div>
      `).join('')}
    </div>
  `
}

// ── Create form ──────────────────────────────────────────────────

function renderCreateForm(state, fn) {
  return html`<div class="card fade-in" style="margin-bottom:16px;">
    <div class="card-header">Create Event Type</div>
    <div style="display:flex;flex-direction:column;gap:12px;max-width:480px;">
      <div><label class="input-label">Title</label><input id="et-title" class="input" placeholder="e.g. Strategy Call" oninput="${fn._setFormField}('title')"></div>
      <div><label class="input-label">Duration (minutes)</label><input id="et-duration" class="input" type="number" min="5" max="480" value="30" oninput="${fn._setFormField}('duration')"></div>
      <div><label class="input-label">Location</label><select id="et-location" class="select" onchange="${fn._setFormField}('location')"><option value="zoom">Zoom</option><option value="meet">Google Meet</option><option value="teams">Microsoft Teams</option><option value="none">None</option></select></div>
      <div><label class="input-label">Visibility</label><select id="et-visibility" class="select" onchange="${fn._setFormField}('visibility')"><option value="public">Public</option><option value="hidden">Hidden (direct link only)</option></select></div>
      <div><label class="input-label">Color</label><input id="et-color" class="input" type="color" value="#7047EB" oninput="${fn._setFormField}('color')"></div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-sm" onclick="${fn.createEventType}()">Create</button>
        <button class="btn btn-ghost btn-sm" onclick="${fn.hideCreateForm}()">Cancel</button>
      </div>
    </div>
  </div>`
}

// ── Edit form ────────────────────────────────────────────────────

function renderEditForm(state, fn, editingId) {
  const et = (state.eventTypes || []).find(e => e.eid === editingId)
  if (!et) return ''
  return html`<div class="card fade-in" style="margin-bottom:16px;border-left:3px solid #7047EB;">
    <div class="card-header">Edit: ${esc(et.title)}</div>
    <div style="display:flex;flex-direction:column;gap:12px;max-width:480px;">
      <div><label class="input-label">Title</label><input id="et-edit-title" class="input" value="${esc(et.title)}"></div>
      <div><label class="input-label">Duration (minutes)</label><input id="et-edit-duration" class="input" type="number" min="5" max="480" value="${esc(String(et.duration || 30))}"></div>
      <div><label class="input-label">Location</label><select id="et-edit-location" class="select">
        ${['zoom','meet','teams','none'].map(loc => html`<option value="${loc}" ${et.location === loc ? 'selected' : ''}>${loc === 'meet' ? 'Google Meet' : loc === 'teams' ? 'Microsoft Teams' : loc === 'none' ? 'None' : 'Zoom'}</option>`).join('')}
      </select></div>
      <div><label class="input-label">Visibility</label><select id="et-edit-visibility" class="select">
        <option value="public" ${et.visibility !== 'hidden' ? 'selected' : ''}>Public</option>
        <option value="hidden" ${et.visibility === 'hidden' ? 'selected' : ''}>Hidden (direct link only)</option>
      </select></div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-sm" onclick="${fn.saveEventType}('${esc(et.eid)}')">Save Changes</button>
        <button class="btn btn-ghost btn-sm" onclick="${fn.cancelEdit}()">Cancel</button>
      </div>
    </div>
  </div>`
}
export function createEventTypes({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return eventTypesView({ state, fn }) },
    state: {
      editingId: '',
      error: '',
      eventTypeSearch: '',
      eventTypes: [],
      loading: true,
      showCreateForm: false,
      user: null
    },
    methods: {
      showCreateForm() {
        ctrl.render({ showCreateForm: true, editingId: '' })
      },
      hideCreateForm() {
        ctrl.render({ showCreateForm: false, editingId: '' })
      },
      editEventType(eid) {
        ctrl.render({ editingId: eid, showCreateForm: false })
      },
      cancelEdit() {
        ctrl.render({ editingId: '' })
      },
      async createEventType() {
        const title = (document.getElementById('et-title')?.value || '').trim()
        if (!title) return
        const uid = ctrl.getState().user?.uid
        const duration = parseInt(document.getElementById('et-duration')?.value || '30')
        const location = document.getElementById('et-location')?.value || 'zoom'
        const visibility = document.getElementById('et-visibility')?.value || 'public'
        const color = document.getElementById('et-color')?.value || '#7047EB'
        const eid = 'evt_' + Math.random().toString(36).slice(2, 8)
        const now = new Date().toISOString()
        const newEvent = { eid, title, duration, location, visibility, color, active: true, createdAt: now }
        // Persist to Firebase
        if (uid) {
          await dbWrite(dbRef(`/event_types/${uid}/${eid}`), newEvent).unwrap()
        }
        // Reload from Firebase to stay in sync
        ctrl.load()
        ctrl.render({ showCreateForm: false })
      },
      async saveEventType(eid) {
        const uid = ctrl.getState().user?.uid
        const title = (document.getElementById('et-edit-title')?.value || '').trim()
        const duration = parseInt(document.getElementById('et-edit-duration')?.value || '30')
        const location = document.getElementById('et-edit-location')?.value || 'zoom'
        const et = (ctrl.getState().eventTypes || []).find(e => e.eid === eid)
        if (!et) return
        const updated = { ...et, title: title || et.title, duration, location, updatedAt: new Date().toISOString() }
        if (uid) {
          await dbUpdate(dbRef(`/event_types/${uid}/${eid}`), updated).unwrap()
        }
        ctrl.load()
        ctrl.render({ editingId: '' })
      },
      async deleteEventType(eid) {
        const uid = ctrl.getState().user?.uid
        if (uid) {
          await dbRemove(dbRef(`/event_types/${uid}/${eid}`)).unwrap()
        }
        ctrl.load()
        ctrl.render({ editingId: '' })
      },
      _setFormField(field) { /* reads from DOM on create/save */ },
      _searchEventTypes() {
        const input = document.querySelector('#event-types-search') || document.querySelector('input[placeholder*="Search"]')
        const query = input?.value || ''
        ctrl.render({ eventTypeSearch: query })
      },
    },
  })

  ctrl.load = async function () {
    const uid = ctrl.getState().user?.uid
    if (!uid) {
      ctrl.render({ loading: false })
      return
    }
    try {
      const [snap, err] = await dbRead(dbRef(`/event_types/${uid}`)).unwrap()
      if (err) throw err
      const eventTypes = snap ? Object.values(snap) : []
      ctrl.render({ eventTypes, loading: false, error: '' })
    } catch (e) {
      console.error('[event-types] load error:', e)
      ctrl.render({ loading: false, error: e.message || 'Failed to load event types' })
    }
  }

  return ctrl
}
