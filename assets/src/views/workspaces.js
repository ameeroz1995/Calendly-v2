/**
 * workspaces.js — Workspaces list view.
 */

import { controller, html, esc } from '../controller.js'
import { dbRef, dbRead } from '../db.js'
import { icon } from '../utils/icons.js'
import { skeletonCards } from '../components/skeleton-card.js'
import { badge } from '../components/badge.js'

export function workspacesView({ state, fn }) {
  if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading workspaces</div>
      <div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div>
      <button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button>
    </div>`
  }
  if (state.loading) return html`<div>${skeletonCards(3)}</div>`

  const workspaces = state.workspaces || []

  return html`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <h2>Workspaces</h2>
    </div>

    ${workspaces.length === 0 ? html`
      <div class="empty-state">
        <div class="empty-state-icon">📂</div>
        <div class="empty-state-title">No workspaces</div>
        <div class="empty-state-desc">Workspaces are created automatically when someone books with you.</div>
      </div>
    ` : ''}

    <div style="display:flex;flex-direction:column;gap:12px;">
      ${workspaces.map(ws => html`
        <div class="card fade-in" style="cursor:pointer;" onclick="${fn.navigateTo}('/workspaces/${esc(ws.wid)}')">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div>
              <div style="font-weight:600;">${esc(ws.clientName || 'Guest')} — ${esc(ws.eventTypeId || 'Meeting')}</div>
              <div style="font-size:0.875rem;color:#8A8993;">${esc(ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : 'Unknown date')}</div>
            </div>
            ${badge(ws.status === 'active' ? 'success' : ws.status === 'completed' ? 'neutral' : 'warning', ws.status || 'Active')}
          </div>
          <div style="margin-top:8px;font-size:0.875rem;color:#8A8993;">
            ${Object.keys(ws.tasks || {}).length} tasks · ${Object.keys(ws.messages || {}).length} messages
          </div>
        </div>
      `).join('')}
    </div>
  `
}
export function createWorkspaces({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return workspacesView({ state, fn }) },
    state: {
      error: '',
      loading: true,
      workspaces: []
    },
    methods: {},
  })
    ctrl.load = async function () {
    const uid = ctrl.getState().user?.uid
    if (!uid) { ctrl.render({ loading: true }); return }
    try {
      const [snap, err] = await dbRead(dbRef('/workspaces')).unwrap()
      if (err) throw err
      const all = snap ? Object.values(snap) : []
      const workspaces = all.filter(w => w.hostId === uid || w.clientId === uid)
      ctrl.render({ workspaces, loading: true, error: '' })
    } catch (e) {
      console.error('[workspaces] load error:', e)
      ctrl.render({ loading: true, error: e.message || 'Failed to load workspaces' })
    }
  }
  return ctrl
}
