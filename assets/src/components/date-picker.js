/**
 * date-picker.js — Date carousel/selector (stateful).
 *
 * Shows next N days (default 14). Days with no availability are grayed out + disabled.
 * Emits onSelect callback with ISO date string.
 *
 * Usage:
 *   import { DatePicker } from './components/date-picker.js'
 *   const dp = DatePicker({ daysToShow:14, availableDates:['2026-06-16',...] })
 *   dp.onSelect((isoDate) => { ... })
 *   parent uses: html`${dp}`
 */

import { controller, html, esc } from '../controller.js'
import { EventBus, MSG } from '../messages/catalog.js'
import { toISODate, formatDateShort } from '../utils/datetime.js'

export function createDatePicker({ daysToShow = 14, availableDates = [] } = {}) {
  const availSet = new Set(availableDates)
  let _onSelect = null

  function buildDates() {
    const dates = []
    const now = new Date()
    for (let i = 0; i < daysToShow; i++) {
      const d = new Date(now)
      d.setUTCDate(d.getUTCDate() + i)
      d.setUTCHours(0, 0, 0, 0)
      const iso = toISODate(d)
      dates.push({ date: d, iso, label: formatDateShort(d), hasSlots: availSet.has(iso) || availSet.size === 0 })
    }
    return dates
  }

  const ctrl = controller({
    template({ state, fn }) {
      const dates = buildDates()
      return html`
        <div id="datepicker-root" class="slot-grid">
          ${dates.map(d => html`
            <button class="slot-btn${state.selected === d.iso ? ' selected' : ''}"
                    onclick="${fn._pick}('${esc(d.iso)}')"
                    ${!d.hasSlots ? 'disabled' : ''}
                    style="${!d.hasSlots ? 'opacity:0.4;cursor:not-allowed;' : ''}">
              ${esc(d.label)}
            </button>
          `).join('')}
        </div>
      `
    },
    state: { selected: '' },
    methods: {
      _pick(iso) {
        if (!availSet.has(iso) && availSet.size > 0) return
        ctrl.render({ selected: iso })
        EventBus.emit(MSG.DATE_SELECTED, { date: iso })
        if (typeof _onSelect === 'function') {
          try { _onSelect(iso) } catch (e) { console.error('[date-picker] onSelect error:', e) }
        }
      },
    },
  })

  ctrl.getSelectedDate = () => ctrl.getState().selected
  ctrl.clear = () => ctrl.render({ selected: '' })
  ctrl.onSelect = (fn) => { _onSelect = fn }
  ctrl.setAvailableDates = (dates) => {
    availSet.clear()
    ;(dates || []).forEach(d => availSet.add(d))
    ctrl.render({})
  }

  return ctrl
}

/** @deprecated Use createDatePicker() instead */
export const DatePicker = createDatePicker
