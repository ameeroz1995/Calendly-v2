/**
 * skeleton-card.js — Card skeleton loader (controller).
 *
 * Usage:
 *   import { createSkeletonCards, skeletonCards } from './components/skeleton-card.js'
 *   const sc = createSkeletonCards({ count: 3 })
 *   parent uses: html`${sc}`  // via toString() → data-cid
 *
 *   // Backward compat (returns toString() directly):
 *   html`${skeletonCards(3)}`
 */

import { controller, html } from '../controller.js'

/**
 * Create a skeleton-cards controller.
 * @param {Object} opts
 * @param {number} [opts.count=1] — number of skeleton cards
 * @returns {Object} controller
 */
export function createSkeletonCards({ count = 1 } = {}) {
  const ctrl = controller({
    template({ state }) {
      let out = ''
      for (let i = 0; i < state.count; i++) {
        out += html`
          <div class="card fade-in" style="animation-delay:${i * 50}ms;">
            <div class="skeleton" style="height:16px;width:60%;margin-bottom:12px;"></div>
            <div class="skeleton" style="height:12px;width:40%;margin-bottom:8px;"></div>
            <div class="skeleton" style="height:12px;width:50%;"></div>
          </div>
        `
      }
      return html`<div id="skeletoncards-root">${out}</div>`
    },
    state: { count },
    methods: {
      setCount(n) { ctrl.render({ count: n }) },
    },
  })
  return ctrl
}

/**
 * Backward-compatible shorthand — returns toString() result for inline use.
 * @param {number} [count=1]
 * @returns {string} HTML placeholder (data-cid)
 */
const _cache = new Map()
export function skeletonCards(count = 1) {
  const key = `${count}`
  if (!_cache.has(key)) _cache.set(key, createSkeletonCards({ count }).toString())
  return _cache.get(key)
}
