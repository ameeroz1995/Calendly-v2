/**
 * login.js — Sign-in page (public route).
 *
 * States: loading → unauthenticated | authenticated(redirect) | error
 */

import { controller, html, esc } from '../controller.js'
import { icon } from '../utils/icons.js'

// ── Pure template (kept for backward compat with current shell) ──

export function loginView({ state, fn }) {
  if (state.authLoading) {
    return html`<div style="display:flex;align-items:center;justify-content:center;min-height:60vh;">
      <div style="text-align:center;">
        <div style="color:#7047EB;margin-bottom:16px;">${icon.spinner}</div>
        <div style="color:#8A8993;">Loading...</div>
      </div>
    </div>`
  }

  if (state.user) {
    return html`<div style="text-align:center;padding:64px 24px;">
      <div class="fade-in">
        <h2 style="margin-bottom:8px;">Already signed in</h2>
        <p style="color:#8A8993;margin-bottom:16px;">Redirecting to dashboard...</p>
      </div>
    </div>`
  }

  if (state.authError && !state.authLoading) {
    return html`<div style="display:flex;align-items:center;justify-content:center;min-height:60vh;">
      <div style="text-align:center;max-width:400px;width:100%;">
        <div style="color:#FF4A5A;font-size:48px;margin-bottom:16px;">${icon.alert}</div>
        <h2 style="margin-bottom:8px;">Sign-in failed</h2>
        <p style="color:#8A8993;margin-bottom:16px;">${esc(state.authError)}</p>
        <button class="btn btn-primary btn-lg" onclick="${fn.signIn}()" style="width:100%;justify-content:center;">
          ${icon.google} Try Again
        </button>
      </div>
    </div>`
  }

  return html`
    <div style="display:flex;align-items:center;justify-content:center;min-height:60vh;">
      <div class="fade-in" style="text-align:center;max-width:400px;width:100%;">
        <div style="width:56px;height:56px;border-radius:14px;background:#7047EB;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Geist',sans-serif;font-weight:700;font-size:24px;margin:0 auto 24px;">C</div>
        <h2 style="margin-bottom:8px;">Welcome to Calendly</h2>
        <p style="color:#8A8993;margin-bottom:32px;">Enterprise scheduling & lifecycle management</p>
        <button class="btn btn-primary btn-lg" onclick="${fn.signIn}()" style="width:100%;justify-content:center;">
          ${icon.google} Sign in with Google
        </button>
      </div>
    </div>
  `
}

// ── Controller factory (for shell-rewrite Phase 9) ──────────────

/**
 * Create a login view controller.
 * @param {Object} opts
 * @param {Object} [opts.router] — router instance
 * @param {Object} [opts.eventBus] — optional EventBus
 * @returns {Object} controller
 */
export function createLoginView({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) {
      return loginView({ state, fn })
    },
    state: { authLoading: false, user: null, authError: '' },
    methods: {
      setAuthState(user, loading, error) {
        ctrl.render({ user, authLoading: loading, authError: error || '' })
      },
    },
  })
  return ctrl
}
