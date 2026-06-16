/**
 * api-keys.js — API Keys management view.
 */

import { icon } from '../utils/icons.js'
import { controller, html, esc } from '../controller.js'
import { skeletonCards } from '../components/skeleton-card.js'
import { badge } from '../components/badge.js'
import { statusDot } from '../components/status-dot.js'

export function apiKeysView({ state, fn }) {
  if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;"><div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div><div class="card-header" style="color:#FF4A5A;">Error loading API keys</div><div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div><button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button></div>`
  }
  if (state.loading) return html`<div>${skeletonCards(2)}</div>`

  const keys = state.apiKeys || []
  const showGenerate = state.showGenerateKey
  const revealedKey = state.revealedKey

  return html`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div><h2>API Keys</h2><p style="color:#8A8993;font-size:0.875rem;">Manage API keys for programmatic access</p></div>
      <button class="btn btn-primary btn-sm" onclick="${fn.showGenerateKey}()">${icon.plus} Generate New Key</button>
    </div>

    ${revealedKey ? html`
      <div class="card fade-in" style="margin-bottom:16px;border-color:#F5A623;background:rgba(245,166,35,0.05);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="color:#F5A623;font-weight:600;">${icon.alert} New API Key Generated</span>
        </div>
        <p style="font-size:0.875rem;color:#8A8993;margin-bottom:8px;">Copy this key now. It will not be shown again.</p>
        <div style="display:flex;gap:8px;">
          <input class="input" value="${esc(revealedKey)}" readonly style="font-family:monospace;font-size:0.75rem;">
          <button class="btn btn-ghost btn-sm" onclick="${fn.copyKey}()">${icon.copy}</button>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="${fn.dismissRevealedKey}()" style="margin-top:8px;">I've copied my key</button>
      </div>
    ` : ''}

    ${showGenerate ? html`
      <div class="card fade-in" style="margin-bottom:16px;">
        <div class="card-header">Generate API Key</div>
        <div style="max-width:480px;">
          <div style="margin-bottom:12px;"><label class="input-label">Key Name</label><input id="ak-name" class="input" placeholder="e.g. Production"></div>
          <div style="margin-bottom:12px;">
            <label class="input-label">Scopes</label>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <label style="display:flex;align-items:center;gap:4px;font-size:0.875rem;cursor:pointer;"><input type="checkbox" value="read:bookings" checked style="accent-color:#7047EB;"> Read Bookings</label>
              <label style="display:flex;align-items:center;gap:4px;font-size:0.875rem;cursor:pointer;"><input type="checkbox" value="write:bookings" style="accent-color:#7047EB;"> Write Bookings</label>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="${fn.generateKey}()">Generate</button>
            <button class="btn btn-ghost btn-sm" onclick="${fn.hideGenerateKey}()">Cancel</button>
          </div>
        </div>
      </div>
    ` : ''}

    <div style="display:flex;flex-direction:column;gap:12px;">
      ${keys.map(k => html`
        <div class="card fade-in">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-weight:600;">${esc(k.name || 'Unnamed')}</span>
            ${statusDot(k.active ? 'green' : 'red')}
          </div>
          <div style="font-size:0.875rem;color:#8A8993;font-family:monospace;">${esc(k.prefix || 'cal_live_')}...</div>
          <div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;">
            ${(k.scopes || ['read:bookings']).map(s => badge('neutral', s)).join('')}
          </div>
          <div style="font-size:0.75rem;color:#8A8993;margin-top:4px;">
            Created ${k.createdAt ? new Date(k.createdAt).toLocaleDateString() : '—'} · Last used ${k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : 'never'}
          </div>
          <button class="btn btn-ghost btn-sm" onclick="${fn.confirmRevokeKey}('${esc(k.kid)}')" style="color:#FF4A5A;margin-top:4px;">Revoke</button>
        </div>
      `).join('')}
    </div>

    ${keys.length === 0 && !showGenerate ? html`
      <div class="empty-state">
        <div style="font-size:48px;margin-bottom:16px;">${icon.key}</div>
        <div class="empty-state-title">No API keys</div>
        <div class="empty-state-desc">Generate an API key for programmatic access to your booking data.</div>
        <button class="btn btn-primary btn-sm" onclick="${fn.showGenerateKey}()">+ Generate Key</button>
      </div>
    ` : ''}
  `
}
export function createApiKeys({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return apiKeysView({ state, fn }) },
    state: {
      apiKeys: [],
      error: '',
      loading: false,
      revealedKey: false,
      showGenerateKey: false
    },
    methods: {
      confirmRevokeKey(kid) {
        const apiKeys = (ctrl.getState().apiKeys || []).map(k =>
          k.kid === kid ? { ...k, active: false } : k
        )
        ctrl.render({ apiKeys })
      },
      copyKey() {
        const state = ctrl.getState()
        if (state.revealedKey && navigator.clipboard) {
          navigator.clipboard.writeText(state.revealedKey).catch(() => {})
        }
      },
      dismissRevealedKey() {ctrl.render({ revealedKey: false })},
      generateKey() {
        const name = (ctrl.$('ak-name')?.value || '').trim()
        if (!name) return
        const kid = 'cal_live_' + Math.random().toString(36).slice(2, 14)
        const now = new Date().toISOString()
        const key = { kid, name, prefix: kid.slice(0, 16), scopes: ['read:bookings'], active: true, createdAt: now }
        const apiKeys = [...(ctrl.getState().apiKeys || []), key]
        ctrl.render({ apiKeys, showGenerateKey: false, revealedKey: kid })
      },
      hideGenerateKey() {ctrl.render({ showGenerateKey: false })},
      showGenerateKey() {ctrl.render({ showGenerateKey: true })}
    },
  })
  return ctrl
}
