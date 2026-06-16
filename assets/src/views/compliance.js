/**
 * compliance.js — Compliance & security view.
 *
 * States: loading | baa_unsigned | baa_signed | saving | error
 */

import { controller, html, esc } from '../controller.js'
import { icon } from '../utils/icons.js'
import { statusDot } from '../components/status-dot.js'

export function complianceView({ state, fn }) {
  if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Failed to load compliance data</div>
      <div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div>
      <button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button>
    </div>`
  }

  if (state.loading) {
    return html`<div style="text-align:center;padding:64px;">
      <div style="color:#8A8993;margin-bottom:16px;">${icon.spinner}</div>
      <div style="color:#8A8993;font-size:0.875rem;">Loading compliance settings...</div>
    </div>`
  }

  const compliance = state.compliance || {}
  const baaSigned = compliance.baaSigned
  const baaDate = compliance.baaSignedDate
  const phiMasking = compliance.phiMasking !== false
  const dataResidency = compliance.dataResidency || 'us-central1'
  const isSaving = state.saving === true

  return html`
    <h2 style="margin-bottom:20px;">Compliance & Security</h2>
    ${state.saveError ? html`<div class="card" style="border-left:3px solid #FF4A5A;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      <span style="color:#FF4A5A;">${icon.alert}</span>
      <span style="color:#F4F3F6;font-size:0.875rem;">${esc(state.saveError)}</span>
      <button class="btn btn-ghost btn-sm" style="margin-left:auto;color:#8A8993;" onclick="${fn.dismissError}()">${icon.x}</button>
    </div>` : ''}
    <div style="display:flex;flex-direction:column;gap:16px;max-width:640px;">
      <div class="card">
        <div class="card-header">Business Associate Agreement (BAA)</div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          ${statusDot(baaSigned ? 'green' : 'red')}
          <span>${baaSigned ? html`Signed — ${esc(baaDate || 'N/A')}` : 'Not signed'}</span>
        </div>
        <div style="display:flex;gap:8px;">
          ${baaSigned ? html`
            <button class="btn btn-ghost btn-sm" onclick="${fn.downloadBAA}()" ${isSaving ? 'disabled' : ''}>Download BAA</button>
            <button class="btn btn-ghost btn-sm" onclick="${fn.revokeBAA}()" style="color:#FF4A5A;" ${isSaving ? 'disabled' : ''}>
              ${isSaving ? html`${icon.spinner} Revoking...` : 'Revoke'}
            </button>
          ` : html`
            <button class="btn btn-primary btn-sm" onclick="${fn.signBAA}()" ${isSaving ? 'disabled' : ''}>
              ${isSaving ? html`${icon.spinner} Signing...` : 'Sign BAA'}
            </button>
          `}
        </div>
      </div>
      <div class="card">
        <div class="card-header">PHI Protection</div>
        <p style="font-size:0.875rem;color:#8A8993;margin-bottom:12px;">Protected Health Information is encrypted at rest (AES-256-GCM) and masked in notifications.</p>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:500;">
          <input type="checkbox" ${phiMasking ? 'checked' : ''} onchange="${fn.togglePhiMasking}()" style="accent-color:#7047EB;" ${isSaving ? 'disabled' : ''}>
          Mask patient identities in calendar notifications
        </label>
      </div>
      <div class="card">
        <div class="card-header">Data Residency</div>
        <select class="select" style="max-width:300px;" onchange="${fn.setDataResidency}()" ${isSaving ? 'disabled' : ''}>
          <option value="us-central1" ${dataResidency === 'us-central1' ? 'selected' : ''}>United States (us-central1)</option>
          <option value="europe-west1" ${dataResidency === 'europe-west1' ? 'selected' : ''}>European Union (europe-west1)</option>
          <option value="asia-southeast1" ${dataResidency === 'asia-southeast1' ? 'selected' : ''}>Asia Pacific (asia-southeast1)</option>
        </select>
      </div>
      <div class="card">
        <div class="card-header">Data Retention</div>
        <p style="font-size:0.875rem;color:#8A8993;">Booking data is retained for 1 year by default. Audit logs are immutable and retained for 1 year.</p>
      </div>
    </div>
  `
}

export function createComplianceView({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return complianceView({ state, fn }) },
    state: { loading: false, error: '', compliance: {}, saving: false, saveError: '' },
    methods: {
      setCompliance(data) { ctrl.render({ compliance: data, loading: false }) },
      setSaving(v) { ctrl.render({ saving: v }) },
      setError(e) { ctrl.render({ error: e, loading: false }) },
    },
  })
  return ctrl
}
