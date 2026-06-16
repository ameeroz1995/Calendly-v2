/**
 * empty-state.js — Empty state placeholder (stateful).
 *
 * Usage:
 *   import { EmptyState } from './components/empty-state.js'
 *   const es = EmptyState()
 *   es.configure({ icon:'📅', title:'No events', desc:'Create your first event type', actionLabel:'+ New', onAction: () => router.go('/event-types') })
 *   es.show()  // displays it
 *   es.hide()  // hides it
 *   parent uses: html`${es}`
 */

import { controller, html, esc } from '../controller.js'

export function createEmptyState() {
  const ctrl = controller({
    template({ state, fn }) {
      if (!state.visible) return html`<span style="display:none;" id="empty-state-root"></span>`
      return html`
        <div id="empty-state-root" class="empty-state fade-in">
          <div class="empty-state-icon">${esc(state.icon)}</div>
          <div class="empty-state-title">${esc(state.title)}</div>
          ${state.desc ? html`<div class="empty-state-desc">${esc(state.desc)}</div>` : ''}
          ${state.actionLabel ? html`
            <button class="btn btn-primary btn-sm" onclick="${fn.onAction}()">${esc(state.actionLabel)}</button>
          ` : ''}
        </div>
      `
    },
    state: { visible: false, icon: '📋', title: '', desc: '', actionLabel: '', onAction: null },
    methods: {
      configure(opts) {
        ctrl.render({ ...opts })
      },
      show() { ctrl.render({ visible: true }) },
      hide() { ctrl.render({ visible: false }) },
      onAction() {
        const s = ctrl.getState()
        if (typeof s.onAction === 'function') s.onAction()
      },
    },
  })
  return ctrl
}

/** @deprecated Use createEmptyState() instead */
export const EmptyState = createEmptyState
