/**
 * status-dot.js — Status indicator dot (controller).
 *
 * Usage:
 *   import { createStatusDot, statusDot } from './components/status-dot.js'
 *   const sd = createStatusDot({ color: 'green' })
 *   parent uses: html`${sd}`  // via toString() → data-cid
 *
 *   // Backward compat (returns toString() directly):
 *   html`${statusDot('green')}`
 */

import { controller, html } from '../controller.js'

const COLORS = {
  green:  'status-dot-green',
  yellow: 'status-dot-yellow',
  red:    'status-dot-red',
  gray:   'status-dot-gray',
}

/**
 * Create a status-dot controller.
 * @param {Object} opts
 * @param {string} [opts.color='gray'] — green|yellow|red|gray
 * @returns {Object} controller
 */
export function createStatusDot({ color = 'gray' } = {}) {
  const ctrl = controller({
    template({ state }) {
      const cls = COLORS[state.color] || COLORS.gray
      return html`<span id="statusdot-root" class="status-dot ${cls}"></span>`
    },
    state: { color },
    methods: {
      setColor(c) { ctrl.render({ color: c }) },
    },
  })
  return ctrl
}

/**
 * Backward-compatible shorthand — returns toString() result for inline use.
 * @param {string} [color='gray'] — green|yellow|red|gray
 * @returns {string} HTML placeholder (data-cid)
 */
export function statusDot(color = 'gray') {
  return createStatusDot({ color }).toString()
}
