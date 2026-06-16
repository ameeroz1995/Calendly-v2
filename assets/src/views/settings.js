/**
 * settings.js — Settings view.
 */

import { icon } from '../utils/icons.js'
import { controller, html, esc } from '../controller.js'

export function settingsView({ state, fn }) {
  if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;"><div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div><div class="card-header" style="color:#FF4A5A;">Error loading settings</div><div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div><button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button></div>`
  }
  if (state.loading) {
    return html`<div style="text-align:center;padding:48px;color:#8A8993;">Loading settings...</div>`
  }

  const profile = state.user || {}
  const prefs = state.notificationPrefs || {}

  return html`
    <h2 style="margin-bottom:20px;">Settings</h2>

    <div style="display:flex;flex-direction:column;gap:16px;max-width:560px;">
      <!-- Profile -->
      <div class="card">
        <div class="card-header">Profile</div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div><label class="input-label">Display Name</label><input id="st-name" class="input" value="${esc(profile.displayName || '')}"></div>
          <div><label class="input-label">Email</label><input id="st-email" class="input" value="${esc(profile.email || '')}" disabled></div>
          <div><label class="input-label">Timezone</label><select id="st-tz" class="select">
            <option value="America/New_York" ${(profile.timezone || '') === 'America/New_York' ? 'selected' : ''}>America/New York (UTC-5)</option>
            <option value="America/Chicago" ${profile.timezone === 'America/Chicago' ? 'selected' : ''}>America/Chicago (UTC-6)</option>
            <option value="America/Los_Angeles" ${profile.timezone === 'America/Los_Angeles' ? 'selected' : ''}>America/Los Angeles (UTC-8)</option>
            <option value="Europe/London" ${profile.timezone === 'Europe/London' ? 'selected' : ''}>Europe/London (UTC+0)</option>
            <option value="Asia/Riyadh" ${profile.timezone === 'Asia/Riyadh' ? 'selected' : ''}>Asia/Riyadh (UTC+3)</option>
            <option value="Asia/Dubai" ${profile.timezone === 'Asia/Dubai' ? 'selected' : ''}>Asia/Dubai (UTC+4)</option>
          </select></div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="card">
        <div class="card-header">Notifications</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" ${prefs.emailBookings !== false ? 'checked' : ''} style="accent-color:#7047EB;"> Email for new bookings
          </label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" ${prefs.emailCancellations !== false ? 'checked' : ''} style="accent-color:#7047EB;"> Email for cancellations
          </label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" ${prefs.smsReminders ? 'checked' : ''} style="accent-color:#7047EB;"> SMS reminders (24h before)
          </label>
        </div>
      </div>

      <button class="btn btn-primary" onclick="${fn.saveSettings}()">${state.saving ? 'Saving...' : 'Save Changes'}</button>

      <div style="border-top:1px solid #262431;padding-top:16px;margin-top:8px;">
        <button class="btn btn-ghost" onclick="${fn.deleteAccount}()" style="color:#FF4A5A;border-color:transparent;">Delete Account</button>
      </div>
    </div>
  `
}
export function createSettings({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return settingsView({ state, fn }) },
    state: {
      error: '',
      loading: false,
      notificationPrefs: {},
      saving: false,
      user: null
    },
    methods: {
      saveSettings() {
        ctrl.render({ saving: true })
        const name = ctrl.$('st-name')?.value || ''
        const tz = ctrl.$('st-tz')?.value || ''
        const user = { ...ctrl.getState().user, displayName: name, timezone: tz }
        setTimeout(() => ctrl.render({ saving: false, user }), 500)
      },
      deleteAccount() {
        if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
          import('../firebase.js').then(({ auth }) => {
            // Firebase account deletion
          }).catch(() => {})
        }
      }
    },
  })
  return ctrl
}
