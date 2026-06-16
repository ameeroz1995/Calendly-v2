/**
 * toast.js — Toast notification system (stateful).
 *
 * Listens to EventBus MSG.SHOW_TOAST for cross-component toast requests.
 * Auto-dismisses after 4s. Click dismisses early. Stacks vertically.
 *
 * Usage:
 *   import { Toast } from './components/toast.js'
 *   import { bus, MSG } from '../messages/catalog.js'
 *   const toast = Toast(bus)
 *   // From anywhere: bus.emit(MSG.SHOW_TOAST, { type:'success', message:'Saved' })
 *   parent uses: html`${toast}`
 */

import { controller, html, esc } from '../controller.js'
import { MSG } from '../messages/catalog.js'

const DISMISS_MS = 4000

export function createToast(bus) {
  let nextId = 0

  const ctrl = controller({
    template({ state, fn }) {
      return html`
        <div id="toast-root" class="toast-container">
          ${state.toasts.map(t => html`
            <div class="toast toast-${t.type} slide-up" onclick="${fn.dismiss}(${t.id})">
              <span>${esc(t.icon)}</span> ${esc(t.message)}
            </div>
          `).join('')}
        </div>
      `
    },
    state: { toasts: [] },
    methods: {
      add(type, message) {
        const id = ++nextId
        const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }
        const toasts = [...ctrl.getState().toasts, { id, type, message, icon: icons[type] || 'ℹ' }]
        ctrl.render({ toasts })
        ctrl.defer(() => ctrl.dismiss(id), DISMISS_MS)
      },
      dismiss(id) {
        const toasts = ctrl.getState().toasts.filter(t => t.id !== id)
        ctrl.render({ toasts })
      },
    },
  })

  // Preset methods
  ctrl.success = (msg) => ctrl.add('success', msg)
  ctrl.error   = (msg) => ctrl.add('error', msg)
  ctrl.warning = (msg) => ctrl.add('warning', msg)
  ctrl.info    = (msg) => ctrl.add('info', msg)

  // Listen to EventBus
  if (bus) {
    bus.on(MSG.SHOW_TOAST, (data) => {
      ctrl.add(data.type || 'info', data.message || '')
    })
  }

  return ctrl
}

/** @deprecated Use createToast() instead */
export const Toast = createToast
