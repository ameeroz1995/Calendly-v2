/**
 * pools.js — Routing pools list + detail view.
 */

import { controller, html, esc } from '../controller.js'
import { skeletonCards } from '../components/skeleton-card.js'
import { badge } from '../components/badge.js'
import { statusDot } from '../components/status-dot.js'
import { icon } from '../utils/icons.js'

export function poolsView({ state, fn }) {
  if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading pools</div>
      <div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div>
      <button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button>
    </div>`
  }
  if (state.loading) return html`<div>${skeletonCards(3)}</div>`

  const pools = state.pools || []
  const showCreate = state.showCreatePool

  return html`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div><h2>Routing Pools</h2><p style="color:#8A8993;font-size:0.875rem;">Groups of team members for round-robin or collective assignment</p></div>
      <button class="btn btn-primary btn-sm" onclick="${fn.showCreatePool}()">${icon.plus} New Pool</button>
    </div>

    ${showCreate ? html`
      <div class="card fade-in" style="margin-bottom:16px;">
        <div class="card-header">Create Pool</div>
        <div style="max-width:480px;">
          <div style="margin-bottom:12px;"><label class="input-label">Pool Name</label><input id="pl-name" class="input" placeholder="e.g. Sales Team"></div>
          <div style="margin-bottom:12px;"><label class="input-label">Strategy</label><select id="pl-strategy" class="select"><option value="round_robin">Round Robin</option><option value="collective">Collective</option></select></div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="${fn.createPool}()">Create</button>
            <button class="btn btn-ghost btn-sm" onclick="${fn.hideCreatePool}()">Cancel</button>
          </div>
        </div>
      </div>
    ` : ''}

    <div style="display:flex;flex-direction:column;gap:12px;">
      ${pools.map(p => html`
        <div class="card fade-in">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-weight:600;">${esc(p.name)}</span>
            ${badge(p.strategy === 'collective' ? 'warning' : 'info', p.strategy === 'collective' ? 'Collective' : 'Round Robin')}
          </div>
          <div style="font-size:0.875rem;color:#8A8993;margin-bottom:8px;">${(p.members || []).length} members</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${[...(p.members || [])].sort((a, b) => (a.priority || 99) - (b.priority || 99)).map(m => html`
              <span class="badge badge-neutral" style="display:inline-flex;align-items:center;gap:6px;">
                ${statusDot('green')} ${esc(m.name || m.uid)}
                ${m.priority != null ? html`<span style="font-size:0.625rem;color:#8A8993;">P${m.priority}</span>` : ''}
              </span>
            `).join('')}
          </div>
          <div style="margin-top:8px;display:flex;gap:8px;">
            <button class="btn btn-ghost btn-sm" onclick="${fn.openPool}('${esc(p.pid)}')">Edit</button>
            <button class="btn btn-ghost btn-sm" onclick="${fn.deletePool}('${esc(p.pid)}')" style="color:#FF4A5A;">Delete</button>
          </div>
        </div>
      `).join('')}
    </div>

    ${pools.length === 0 ? html`
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <div class="empty-state-title">No routing pools</div>
        <div class="empty-state-desc">Create a pool to distribute bookings across your team.</div>
        <button class="btn btn-primary btn-sm" onclick="${fn.showCreatePool}()">+ Create Pool</button>
      </div>
    ` : ''}
  `
}
export function createPools({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return poolsView({ state, fn }) },
    state: {
      error: '',
      loading: false,
      pools: [],
      showCreatePool: false
    },
    methods: {
      createPool() {
        const name = (ctrl.$('pool-name')?.value || '').trim()
        if (!name) return
        const pid = 'pl_' + Math.random().toString(36).slice(2, 8)
        const now = new Date().toISOString()
        const pool = { pid, name, members: [], active: true, createdAt: now }
        const pools = [...(ctrl.getState().pools || []), pool]
        ctrl.render({ pools, showCreatePool: false })},
      deletePool(pid) {
        const pools = (ctrl.getState().pools || []).filter(p => p.pid !== pid)
        ctrl.render({ pools })
      },
      hideCreatePool() {ctrl.render({ showCreatePool: false })},
      openPool(pid) { /* Navigate to pool detail */ },
      showCreatePool() {ctrl.render({ showCreatePool: true })}
    },
  })
  return ctrl
}
