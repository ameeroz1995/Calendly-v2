/**
 * pagination.js — Page navigation (stateful).
 *
 * Usage:
 *   import { Pagination } from './components/pagination.js'
 *   const p = Pagination()
 *   p.setTotalPages(5)
 *   p.onChange((page) => { ... })
 *   parent uses: html`${p}`
 */

import { controller, html } from '../controller.js'

const MAX_VISIBLE = 7

export function createPagination() {
  let _onChange = null
  let _total = 1

  function getPages(current, total) {
    if (total <= MAX_VISIBLE) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }
    const pages = [1]
    let start = Math.max(2, current - 1)
    let end = Math.min(total - 1, current + 1)
    // Expand to show at least 3 middle pages
    if (end - start < 2) {
      if (start === 2) end = Math.min(total - 1, 4)
      else start = Math.max(2, total - 3)
    }
    if (start > 2) pages.push('...')
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < total - 1) pages.push('...')
    pages.push(total)
    return pages
  }

  const ctrl = controller({
    template({ state, fn }) {
      const pages = getPages(state.current, _total)
      if (_total <= 1 && !state.alwaysShow) return html`<div id="pagination-root"></div>`

      return html`
        <div id="pagination-root" class="pagination">
          <button class="pagination-btn" onclick="${fn.goPage}(${state.current - 1})" ${state.current <= 1 ? 'disabled' : ''}>‹</button>
          ${pages.map(p => {
            if (p === '...') return html`<span class="pagination-btn" style="border:none;cursor:default;">…</span>`
            return html`<button class="pagination-btn${p === state.current ? ' active' : ''}" onclick="${fn.goPage}(${p})">${p}</button>`
          }).join('')}
          <button class="pagination-btn" onclick="${fn.goPage}(${state.current + 1})" ${state.current >= _total ? 'disabled' : ''}>›</button>
        </div>
      `
    },
    state: { current: 1, alwaysShow: false },
    methods: {
      goPage(page) {
        if (page < 1 || page > _total) return
        ctrl.render({ current: page })
        if (typeof _onChange === 'function') {
          try { _onChange(page) } catch (e) { console.error('[pagination] onChange error:', e) }
        }
      },
    },
  })

  ctrl.setTotalPages = (n) => { _total = Math.max(1, n); ctrl.render({ current: Math.min(ctrl.getState().current, _total) }) }
  ctrl.goPage = (p) => ctrl.goPage(p)
  ctrl.nextPage = () => ctrl.goPage(ctrl.getState().current + 1)
  ctrl.prevPage = () => ctrl.goPage(ctrl.getState().current - 1)
  ctrl.onChange = (fn) => { _onChange = fn }

  return ctrl
}

/** @deprecated Use createPagination() instead */
export const Pagination = createPagination
