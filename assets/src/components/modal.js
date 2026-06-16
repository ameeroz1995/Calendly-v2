/**
 * modal.js — Modal dialog (stateful).
 *
 * Usage:
 *   import { Modal } from './components/modal.js'
 *   const modal = Modal()
 *   modal.configure({ title:'Title', bodyHtml:'...', footerHtml:'...', onClose:()=>{} })
 *   modal.open()
 *   modal.close()
 *   // Closes on backdrop click, Escape, or footer close button.
 *   parent uses: html`${modal}`
 */

import { controller, html, esc } from '../controller.js'

export function createModal() {
  let _onClose = null

  const ctrl = controller({
    template({ state, fn }) {
      if (!state.open) return html`<span id="modal-root" style="display:none;"></span>`
      return html`
        <div id="modal-root">
          <div class="modal-backdrop" id="modal-backdrop" onclick="${fn._backdropClick}()">
            <div class="modal-dialog" id="modal-dialog" onclick="event.stopPropagation()" role="dialog" aria-modal="true">
              <div class="modal-title">${esc(state.title)}</div>
              <div class="modal-body">${state.bodyHtml || ''}</div>
              <div class="modal-footer">${state.footerHtml || ''}</div>
            </div>
          </div>
        </div>
      `
    },
    state: { open: false, title: '', bodyHtml: '', footerHtml: '' },
    methods: {
      configure(opts) {
        if (opts.onClose !== undefined) _onClose = opts.onClose
        ctrl.render({
          title: opts.title || '',
          bodyHtml: opts.bodyHtml || '',
          footerHtml: opts.footerHtml || '',
        })
      },
      open() {
        ctrl.render({ open: true })
        document.addEventListener('keydown', _onEscape)
      },
      close() {
        ctrl.render({ open: false })
        document.removeEventListener('keydown', _onEscape)
        if (typeof _onClose === 'function') {
          try { _onClose() } catch (e) { console.error('[modal] onClose error:', e) }
        }
      },
      _backdropClick() {
        ctrl.close()
      },
    },
  })

  function _onEscape(e) {
    if (e.key === 'Escape') ctrl.close()
  }

  return ctrl
}

/** @deprecated Use createModal() instead */
export const Modal = createModal
