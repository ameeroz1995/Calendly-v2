/**
 * resources.js — Resource booking view (Phase 7).
 * Meeting rooms, equipment, shared spaces.
 */

import { controller, html, esc } from '../controller.js'
import { icon } from '../utils/icons.js'
import { skeletonCards } from '../components/skeleton-card.js'
import { badge } from '../components/badge.js'
import { statusDot } from '../components/status-dot.js'

export function resourcesView({ state, fn }) {
    if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading data</div>
      <div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div>
      <button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button>
    </div>`
  }
  if (state.loading) return html`<div>${skeletonCards(3)}</div>`

  const resources = state.resources || []

  return html`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div><h2>Resources</h2><p style="color:#8A8993;font-size:0.875rem;">Meeting rooms, equipment, shared spaces</p></div>
      <button class="btn btn-primary btn-sm" onclick="${fn.showCreateResource}()">+ Add Resource</button>
    </div>

    ${resources.length === 0 ? html`
      <div class="empty-state">
        <div style="font-size:48px;margin-bottom:16px;">${icon.calendar}</div>
        <div class="empty-state-title">No resources</div>
        <div class="empty-state-desc">Add meeting rooms, equipment, or shared spaces for booking.</div>
        <button class="btn btn-primary btn-sm" onclick="${fn.showCreateResource}()">+ Add Resource</button>
      </div>
    ` : ''}

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">
      ${resources.map(r => html`
        <div class="card fade-in">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
            <div style="font-weight:600;">${esc(r.name)}</div>
            ${badge(r.type === 'room' ? 'info' : r.type === 'equipment' ? 'warning' : 'neutral', r.type)}
          </div>
          ${r.capacity ? html`<div style="font-size:0.875rem;color:#8A8993;margin-bottom:4px;">Capacity: ${r.capacity}</div>` : ''}
          ${r.location ? html`<div style="font-size:0.875rem;color:#8A8993;margin-bottom:4px;">${icon.link} ${esc(r.location)}</div>` : ''}
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
            ${statusDot(r.active ? 'green' : 'red')}
            <span style="font-size:0.875rem;color:#8A8993;">${r.active ? 'Available' : 'Inactive'}</span>
            <span style="flex:1;"></span>
            <button class="btn btn-ghost btn-sm" onclick="${fn.editResource}('${esc(r.rid)}')">Edit</button>
            <button class="btn btn-ghost btn-sm" onclick="${fn.deleteResource}('${esc(r.rid)}')" style="color:#FF4A5A;">Delete</button>
          </div>
        </div>
      `).join('')}
    </div>
  `
}
export function createResources({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return resourcesView({ state, fn }) },
    state: {
      error: '',
      loading: false,
      resources: []
    },
    methods: {
      deleteResource(rid) {
        const resources = (ctrl.getState().resources || []).filter(r => r.rid !== rid)
        ctrl.render({ resources })
      },
      editResource(rid) { /* Open edit form */ },
      showCreateResource() {ctrl.render({ showCreateResource: true })}
    },
  })
  return ctrl
}
