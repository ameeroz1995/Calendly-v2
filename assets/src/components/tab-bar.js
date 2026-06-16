/**
 * tab-bar.js — Horizontal tab navigation (stateful).
 *
 * Usage:
 *   import { TabBar } from './components/tab-bar.js'
 *   const tabs = TabBar({ tabs: [{id:'all',label:'All'},{id:'active',label:'Active'}] })
 *   tabs.onChange((tabId) => { ... })
 *   parent uses: html`${tabs}`
 */

import { controller, html, esc } from '../controller.js'

export function createTabBar({ tabs = [], initial = '' } = {}) {
  let _onChange = null

  const ctrl = controller({
    template({ state, fn }) {
      return html`
        <div id="tabbar-root" class="tab-bar" role="tablist">
          ${tabs.map(tab => html`
            <button class="tab-item${state.active === tab.id ? ' active' : ''}"
                    role="tab"
                    aria-selected="${state.active === tab.id ? 'true' : 'false'}"
                    onclick="${fn.select}('${esc(tab.id)}')">
              ${esc(tab.label)}
            </button>
          `).join('')}
        </div>
      `
    },
    state: { active: initial || (tabs[0]?.id || '') },
    methods: {
      select(id) {
        ctrl.render({ active: id })
        if (typeof _onChange === 'function') {
          try { _onChange(id) } catch (e) { console.error('[tab-bar] onChange error:', e) }
        }
      },
    },
  })

  ctrl.onChange = (fn) => { _onChange = fn }
  ctrl.getActiveTab = () => ctrl.getState().active
  ctrl.setActive = (id) => ctrl.render({ active: id })

  return ctrl
}

/** @deprecated Use createTabBar() instead */
export const TabBar = createTabBar
