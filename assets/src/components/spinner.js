/**
 * spinner.js — Loading spinner (stateful).
 *
 * Usage:
 *   import { Spinner } from './components/spinner.js'
 *   const s = Spinner()
 *   s.show()  // displays spinner
 *   s.hide()  // hides it
 *   parent uses: html`${s}`
 */

import { controller, html } from '../controller.js'

export function createSpinner() {
  const ctrl = controller({
    template({ state }) {
      if (!state.visible) return html`<span style="display:none;" id="spinner-root"></span>`
      return html`
        <div id="spinner-root" style="display:flex;align-items:center;justify-content:center;padding:32px;">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#7047EB" stroke-width="2" stroke-linecap="round" class="pulse">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </div>
      `
    },
    state: { visible: false },
    methods: {
      show() { ctrl.render({ visible: true }) },
      hide() { ctrl.render({ visible: false }) },
    },
  })
  return ctrl
}

/** @deprecated Use createSpinner() instead */
export const Spinner = createSpinner
