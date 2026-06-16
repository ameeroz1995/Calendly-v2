/**
 * copy-button.js — Copy-to-clipboard button (stateful).
 *
 * Uses navigator.clipboard API. Shows "Copied!" feedback for 2s.
 *
 * Usage:
 *   import { CopyButton } from './components/copy-button.js'
 *   const cb = CopyButton({ text:'https://book.example.com/amir/strat' })
 *   parent uses: html`${cb}`
 */

import { controller, html, esc } from '../controller.js'

const FEEDBACK_MS = 2000

export function createCopyButton({ text = '', label = 'Copy' } = {}) {
  const ctrl = controller({
    template({ state, fn }) {
      const isCopied = state.copied
      return html`
        <div id="copybtn-root" style="display:inline-flex;">
          <button class="copy-btn${isCopied ? ' copied' : ''}" onclick="${fn.copy}()" ${isCopied ? 'disabled' : ''}>
            ${isCopied ? '✓ Copied!' : esc(label)}
          </button>
        </div>
      `
    },
    state: { copied: false },
    methods: {
      async copy() {
        try {
          await navigator.clipboard.writeText(text)
          ctrl.render({ copied: true })
          ctrl.defer(() => ctrl.render({ copied: false }), FEEDBACK_MS)
        } catch (e) {
          console.error('[copy-button] clipboard write failed:', e)
        }
      },
    },
  })

  ctrl.setText = (t) => { text = t }
  ctrl.setLabel = (l) => { ctrl.render({}) /* re-render picks up new label via closure */ }

  return ctrl
}

/** @deprecated Use createCopyButton() instead */
export const CopyButton = createCopyButton
