/**
 * badge.js — Status badge (controller).
 *
 * Usage:
 *   import { createBadge, badge } from './components/badge.js'
 *   const b = createBadge({ variant: 'success', label: 'Confirmed' })
 *   parent uses: html`${b}`  // via toString() → data-cid
 *
 *   // Backward compat (returns toString() directly):
 *   html`${badge('success', 'Confirmed')}`
 */

import { controller, html, esc } from '../controller.js'

const STYLES = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  info:    'badge-info',
  neutral: 'badge-neutral',
}

/**
 * Create a badge controller.
 * @param {Object} opts
 * @param {string} [opts.variant='neutral'] — success|warning|danger|info|neutral
 * @param {string} [opts.label='']
 * @returns {Object} controller
 */
export function createBadge({ variant = 'neutral', label = '' } = {}) {
  const ctrl = controller({
    template({ state }) {
      const cls = STYLES[state.variant] || STYLES.neutral
      return html`<span id="badge-root" class="badge ${cls}">${esc(state.label)}</span>`
    },
    state: { variant, label },
    methods: {
      setVariant(v) { ctrl.render({ variant: v }) },
      setLabel(l) { ctrl.render({ label: l }) },
      update(v, l) { ctrl.render({ variant: v, label: l }) },
    },
  })
  return ctrl
}

/**
 * Backward-compatible shorthand — returns toString() result for inline use.
 * @param {string} [variant='neutral']
 * @param {string} [label='']
 * @returns {string} HTML placeholder (data-cid)
 */
export function badge(variant = 'neutral', label = '') {
  return createBadge({ variant, label }).toString()
}
