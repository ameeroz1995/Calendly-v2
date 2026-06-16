/**
 * time-slot-grid.js — Clickable time slot grid (stateful).
 *
 * Usage:
 *   import { TimeSlotGrid } from './components/time-slot-grid.js'
 *   const tsg = TimeSlotGrid()
 *   tsg.setSlots([{ iso:'...', time:'9:00 AM', status:'free' }, ...])
 *   tsg.onSelect((slot) => { ... })  // returns the selected slot object
 *   parent uses: html`${tsg}`
 */

import { controller, html, esc } from '../controller.js'
import { EventBus, MSG } from '../messages/catalog.js'

export function createTimeSlotGrid() {
  let _slots = []
  let _onSelect = null

  const ctrl = controller({
    template({ state, fn }) {
      return html`
        <div id="slotgrid-root" class="slot-grid">
          ${_slots.length === 0 ? html`<div style="grid-column:1/-1;text-align:center;color:#8A8993;padding:16px;">No time slots available</div>` : ''}
          ${_slots.map(slot => {
            const isSelected = state.selected === slot.iso
            const isFree = slot.status === 'free'
            return html`
              <button class="slot-btn${isSelected ? ' selected' : ''}"
                      onclick="${fn._pick}('${esc(slot.iso)}')"
                      ${!isFree ? 'disabled' : ''}
                      style="${!isFree ? 'opacity:0.3;cursor:not-allowed;' : ''}">
                ${esc(slot.time || slot.iso)}
              </button>
            `
          }).join('')}
        </div>
      `
    },
    state: { selected: '' },
    methods: {
      _pick(iso) {
        ctrl.render({ selected: iso })
        const slot = _slots.find(s => s.iso === iso)
        if (slot) {
          EventBus.emit(MSG.SLOT_SELECTED, { slot })
        }
        if (slot && typeof _onSelect === 'function') {
          try { _onSelect(slot) } catch (e) { console.error('[slot-grid] onSelect error:', e) }
        }
      },
    },
  })

  ctrl.setSlots = (slots) => { _slots = slots || []; ctrl.render({ selected: '' }) }
  ctrl.getSelectedSlot = () => _slots.find(s => s.iso === ctrl.getState().selected) || null
  ctrl.clear = () => ctrl.render({ selected: '' })
  ctrl.onSelect = (fn) => { _onSelect = fn }

  return ctrl
}

/** @deprecated Use createTimeSlotGrid() instead */
export const TimeSlotGrid = createTimeSlotGrid
