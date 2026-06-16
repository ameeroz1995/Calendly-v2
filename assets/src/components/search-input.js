/**
 * search-input.js — Debounced search input (stateful).
 *
 * Emits MSG.SEARCH_CHANGED via EventBus with { query: string }.
 * Also fires onChange callback if set.
 *
 * Usage:
 *   import { SearchInput } from './components/search-input.js'
 *   const search = SearchInput({ placeholder:'Search...', debounceMs:300 })
 *   parent uses: html`${search}`
 */

import { controller, html, esc } from '../controller.js'
import { EventBus, MSG } from '../messages/catalog.js'

const DEFAULT_DEBOUNCE = 300

export function createSearchInput({ placeholder = 'Search...', debounceMs = DEFAULT_DEBOUNCE } = {}) {
  let _timer = null
  let _onChange = null

  const ctrl = controller({
    template({ state, fn }) {
      return html`
        <div id="search-root" style="position:relative;">
          <input id="search-input"
                 class="input"
                 type="text"
                 placeholder="${esc(placeholder)}"
                 value="${esc(state.query)}"
                 oninput="${fn._onInput}()"
                 style="padding-left:36px;">
          <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8A8993;pointer-events:none;"
               viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
      `
    },
    state: { query: '' },
    methods: {
      clear() {
        ctrl.render({ query: '' })
        _notify('')
      },
      _onInput() {
        const el = ctrl.$('search-input')
        if (!el) return
        const query = el.value
        ctrl.render({ query })
        clearTimeout(_timer)
        _timer = setTimeout(() => _notify(query), debounceMs)
      },
    },
  })

  function _notify(query) {
    EventBus.emit(MSG.SEARCH_CHANGED, { query })
    if (typeof _onChange === 'function') _onChange(query)
  }

  ctrl.getValue = () => ctrl.getState().query
  ctrl.clear = () => { ctrl.render({ query: '' }); _notify('') }
  ctrl.onChange = (fn) => { _onChange = fn }

  return ctrl
}

/** @deprecated Use createSearchInput() instead */
export const SearchInput = createSearchInput
