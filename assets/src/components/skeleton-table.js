/**
 * skeleton-table.js — Table skeleton loader (controller).
 *
 * Usage:
 *   import { createSkeletonTable, skeletonTable } from './components/skeleton-table.js'
 *   const st = createSkeletonTable({ rows: 5, cols: 5 })
 *   parent uses: html`${st}`  // via toString() → data-cid
 *
 *   // Backward compat (returns toString() directly):
 *   html`${skeletonTable(5)}`
 */

import { controller, html } from '../controller.js'

/**
 * Create a skeleton-table controller.
 * @param {Object} opts
 * @param {number} [opts.rows=5] — number of skeleton rows
 * @param {number} [opts.cols=5] — number of columns
 * @returns {Object} controller
 */
export function createSkeletonTable({ rows = 5, cols = 5 } = {}) {
  const ctrl = controller({
    template({ state }) {
      let out = '<div class="table-wrap"><table class="data-table"><thead><tr>'
      for (let c = 0; c < state.cols; c++) {
        out += html`<th><div class="skeleton" style="height:12px;width:${60 + Math.random() * 40}px;"></div></th>`
      }
      out += '</tr></thead><tbody>'
      for (let r = 0; r < state.rows; r++) {
        out += '<tr>'
        for (let c = 0; c < state.cols; c++) {
          out += html`<td><div class="skeleton" style="height:14px;width:${80 + Math.random() * 80}px;"></div></td>`
        }
        out += '</tr>'
      }
      out += '</tbody></table></div>'
      return html`<div id="skeletontable-root">${out}</div>`
    },
    state: { rows, cols },
    methods: {
      setSize(r, c) { ctrl.render({ rows: r, cols: c }) },
    },
  })
  return ctrl
}

/**
 * Backward-compatible shorthand — returns toString() result for inline use.
 * @param {number} [rows=5]
 * @param {number} [cols=5]
 * @returns {string} HTML placeholder (data-cid)
 */
export function skeletonTable(rows = 5, cols = 5) {
  return createSkeletonTable({ rows, cols }).toString()
}
