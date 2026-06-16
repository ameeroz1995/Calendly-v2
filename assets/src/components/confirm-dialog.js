/**
 * confirm-dialog.js — Confirmation dialog controller (wraps Modal).
 *
 * Usage:
 *   import { createConfirmDialog, ConfirmDialog } from './components/confirm-dialog.js'
 *   const confirm = createConfirmDialog()
 *   const ok = await confirm.confirm({
 *     title: 'Delete Event Type?',
 *     message: 'This action cannot be undone.',
 *     confirmLabel: 'Delete',
 *     confirmStyle: 'danger',
 *   })
 *   parent uses: html`${confirm}`
 */

import { createModal } from './modal.js'
import { controller, html, esc } from '../controller.js'

/**
 * Create a confirm-dialog controller.
 * @returns {Object} controller with confirm() method
 */
export function createConfirmDialog() {
  const modal = createModal()
  let _resolve = null

  function confirm({ title = 'Are you sure?', message = '', confirmLabel = 'Confirm', confirmStyle = 'primary' } = {}) {
    return new Promise((resolve) => {
      _resolve = resolve

      const confirmBtnClass = confirmStyle === 'danger' ? 'btn-danger' : 'btn-primary'

      const bodyHtml = html`<p>${esc(message)}</p>`
      const footerHtml = html`
        <button class="btn btn-ghost btn-sm" id="confirm-cancel">Cancel</button>
        <button class="btn ${confirmBtnClass} btn-sm" id="confirm-ok">${esc(confirmLabel)}</button>
      `

      modal.configure({ title, bodyHtml, footerHtml, onClose: () => _finish(false) })
      modal.open()

      // Bind footer buttons after DOM renders
      setTimeout(() => {
        const cancelBtn = document.getElementById('confirm-cancel')
        const okBtn = document.getElementById('confirm-ok')
        if (cancelBtn) cancelBtn.onclick = () => _finish(false)
        if (okBtn) okBtn.onclick = () => _finish(true)
      }, 50)
    })
  }

  function _finish(result) {
    modal.close()
    if (_resolve) {
      _resolve(result)
      _resolve = null
    }
  }

  // Controller wrapper for composition and lifecycle
  const ctrl = controller({
    template() {
      return html`<span id="confirmdialog-root">${modal}</span>`
    },
    state: {},
    methods: {
      confirm,
      destroy() {
        if (_resolve) {
          _resolve(false)
          _resolve = null
        }
        modal.destroy()
      },
    },
  })

  // Expose confirm method directly
  ctrl.confirm = confirm
  ctrl.modal = modal

  return ctrl
}

/** @deprecated Use createConfirmDialog() instead */
export const ConfirmDialog = createConfirmDialog
