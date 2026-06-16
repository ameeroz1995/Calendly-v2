/**
 * webhooks.js — Webhook subscriptions view.
 */

import { icon } from '../utils/icons.js'
import { controller, html, esc } from '../controller.js'
import { dbRef, dbRead, dbWrite, dbRemove } from '../db.js'
import { skeletonCards } from '../components/skeleton-card.js'
import { badge } from '../components/badge.js'
import { statusDot } from '../components/status-dot.js'

export function webhooksView({ state, fn }) {
  if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;"><div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div><div class="card-header" style="color:#FF4A5A;">Error loading webhooks</div><div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div><button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button></div>`
  }
  if (state.loading) return html`<div>${skeletonCards(2)}</div>`

  const webhooks = state.webhooks || []
  const showAdd = state.showAddWebhook

  return html`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div><h2>Webhooks</h2><p style="color:#8A8993;font-size:0.875rem;">Receive real-time event notifications via HTTP POST</p></div>
      <button class="btn btn-primary btn-sm" onclick="${fn.showAddWebhook}()">${icon.plus} Add Webhook</button>
    </div>

    ${showAdd ? html`
      <div class="card fade-in" style="margin-bottom:16px;">
        <div class="card-header">Subscribe Webhook</div>
        <div style="max-width:480px;">
          <div style="margin-bottom:12px;"><label class="input-label">Webhook URL</label><input id="wh-url" class="input" placeholder="https://your-app.com/webhook"></div>
          <div style="margin-bottom:12px;">
            <label class="input-label">Events</label>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <label style="display:flex;align-items:center;gap:4px;font-size:0.875rem;cursor:pointer;"><input type="checkbox" value="invitee.created" checked style="accent-color:#7047EB;"> Booking Created</label>
              <label style="display:flex;align-items:center;gap:4px;font-size:0.875rem;cursor:pointer;"><input type="checkbox" value="invitee.canceled" checked style="accent-color:#7047EB;"> Booking Cancelled</label>
              <label style="display:flex;align-items:center;gap:4px;font-size:0.875rem;cursor:pointer;"><input type="checkbox" value="routing.submitted" style="accent-color:#7047EB;"> Routing Submitted</label>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="${fn.subscribeWebhook}()">Subscribe</button>
            <button class="btn btn-ghost btn-sm" onclick="${fn.hideAddWebhook}()">Cancel</button>
          </div>
        </div>
      </div>
    ` : ''}

    <div style="display:flex;flex-direction:column;gap:12px;">
      ${webhooks.map(w => html`
        <div class="card fade-in">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="font-weight:600;word-break:break-all;">${esc(w.url)}</div>
            ${statusDot(w.active ? 'green' : 'red')}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
            ${(w.events || []).map(e => badge('info', e)).join('')}
          </div>
          <div style="font-size:0.75rem;color:#8A8993;margin-bottom:8px;">
            ${w.lastDelivery ? 'Last delivery: ' + new Date(w.lastDelivery).toLocaleString() : 'No deliveries yet'} · ${w.deliveryCount || 0} deliveries
            ${w.lastResponseCode ? ' · Status: ' + w.lastResponseCode : ''}
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-ghost btn-sm" onclick="${fn.testWebhook}('${esc(w.sid)}')" ${w._testing ? 'disabled' : ''}>${w._testing ? html`${icon.spinner} Testing...` : 'Test'}</button>
            <button class="btn btn-ghost btn-sm" onclick="${fn.unsubscribeWebhook}('${esc(w.sid)}')" style="color:#FF4A5A;">Delete</button>
          </div>
        </div>
      `).join('')}
    </div>

    ${webhooks.length === 0 ? html`
      <div class="empty-state">
        <div style="font-size:48px;margin-bottom:16px;">${icon.webhook}</div>
        <div class="empty-state-title">No webhooks</div>
        <div class="empty-state-desc">Subscribe to webhooks to receive real-time event notifications.</div>
        <button class="btn btn-primary btn-sm" onclick="${fn.showAddWebhook}()">+ Add Webhook</button>
      </div>
    ` : ''}
  `
}
export function createWebhooks({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return webhooksView({ state, fn }) },
    state: {
      error: '',
      loading: true,
      showAddWebhook: false,
      webhooks: []
    },
    methods: {
      hideAddWebhook() { ctrl.render({ showAddWebhook: false }) },
      showAddWebhook() { ctrl.render({ showAddWebhook: true }) },
      subscribeWebhook() {
        const url = (document.getElementById('wh-url')?.value || '').trim()
        if (!url) return
        const uid = ctrl.getState().user?.uid
        const sid = 'wh_' + Math.random().toString(36).slice(2, 8)
        const now = new Date().toISOString()
        const webhook = { sid, url, events: ['invitee.created'], active: true, createdAt: now, deliveryCount: 0 }
        const webhooks = [...(ctrl.getState().webhooks || []), webhook]
        ctrl.render({ webhooks, showAddWebhook: false })
        // Persist to Firebase
        if (uid) {
          dbWrite(dbRef(`/webhook_subscriptions/${uid}/${sid}`), webhook).unwrap()
            .catch(e => console.error('[webhooks] persist error:', e))
        }
      },
      testWebhook(sid) {
        const webhooks = (ctrl.getState().webhooks || []).map(w =>
          w.sid === sid ? { ...w, _testing: true } : w
        )
        ctrl.render({ webhooks })
        ctrl.defer(() => {
          const updated = (ctrl.getState().webhooks || []).map(w =>
            w.sid === sid ? { ...w, _testing: false, lastDelivery: new Date().toISOString(), lastResponseCode: 200, deliveryCount: (w.deliveryCount || 0) + 1 } : w
          )
          ctrl.render({ webhooks: updated })
        }, 1500)
      },
      unsubscribeWebhook(sid) {
        const uid = ctrl.getState().user?.uid
        const webhooks = (ctrl.getState().webhooks || []).filter(w => w.sid !== sid)
        ctrl.render({ webhooks })
        if (uid) {
          dbRemove(dbRef(`/webhook_subscriptions/${uid}/${sid}`)).unwrap()
            .catch(e => console.error('[webhooks] remove error:', e))
        }
      }
    },
  })
    ctrl.load = async function () {
    const uid = ctrl.getState().user?.uid
    if (!uid) { ctrl.render({ loading: true }); return }
    try {
      const [snap, err] = await dbRead(dbRef(`/webhook_subscriptions/${uid}`)).unwrap()
      if (err) throw err
      const webhooks = snap ? Object.values(snap).filter(s => s && typeof s === 'object') : []
      ctrl.render({ webhooks, loading: true, error: '' })
    } catch (e) {
      console.error('[webhooks] load error:', e)
      ctrl.render({ loading: true, error: e.message || 'Failed to load webhooks' })
    }
  }
  return ctrl
}
