/**
 * availability.js — Availability management view.
 */

import { controller, html, esc } from '../controller.js'
import { dbRef, dbRead, dbUpdate } from '../db.js'
import { icon } from '../utils/icons.js'

export function availabilityView({ state, fn }) {
  if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading availability</div>
      <div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div>
      <button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button>
    </div>`
  }
  if (state.loading) {
    return html`<div style="text-align:center;padding:48px;color:#8A8993;" ">${icon.spinner}<div style="margin-top:8px;">Loading availability...</div></div>`
  }

  const workingHours = state.workingHours || {}
  const bookingRules = state.bookingRules || {}
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return html`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div><h2>Availability</h2><p style="color:#8A8993;font-size:0.875rem;">Configure your working hours and booking rules</p></div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost btn-sm" onclick="${fn.copyBookingLink}()">${icon.link} Copy Booking Link</button>
        <button class="btn btn-primary btn-sm" onclick="${fn.saveAvailability}()">${state.saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>

    ${state.availabilityError ? html`<div class="card" style="margin-bottom:16px;border-color:#FF4A5A;"><p style="color:#FF4A5A;font-size:0.875rem;">${esc(state.availabilityError)}</p></div>` : ''}

    <div style="display:grid;grid-template-columns:1fr 300px;gap:20px;">
      <div>
        <!-- Working Hours -->
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header">Working Hours</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${days.map((d, i) => {
              const wh = workingHours[d] || { start: '09:00', end: '17:00', enabled: i < 5 }
              return html`
                <div style="display:flex;align-items:center;gap:8px;">
                  <label style="display:flex;align-items:center;gap:4px;width:36px;font-size:0.875rem;color:#8A8993;cursor:pointer;">
                    <input type="checkbox" ${wh.enabled ? 'checked' : ''} style="accent-color:#7047EB;width:16px;height:16px;" onchange="${fn._toggleDay}('${d}')">
                    ${esc(dayLabels[i])}
                  </label>
                  ${wh.enabled ? html`
                    <input id="wh-start-${d}" class="input" type="time" value="${esc(wh.start)}" style="width:110px;min-height:36px;">
                    <span style="color:#8A8993;">–</span>
                    <input id="wh-end-${d}" class="input" type="time" value="${esc(wh.end)}" style="width:110px;min-height:36px;">
                  ` : html`<span style="color:#8A8993;font-size:0.875rem;">Unavailable</span>`}
                </div>
              `
            }).join('')}
          </div>
        </div>

        <!-- Month Calendar Preview -->
        <div class="card">
          <div class="card-header">Month Preview</div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;">
            ${dayLabels.map(d => html`<div style="font-size:0.75rem;color:#8A8993;padding:4px;">${esc(d)}</div>`).join('')}
            ${renderMonthDays(state.monthGrid || [])}
          </div>
        </div>
      </div>

      <!-- Booking Rules -->
      <div>
        <div class="card" style="margin-bottom:12px;">
          <div class="card-header">Booking Rules</div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div><label class="input-label">Max bookings per day</label><input id="br-maxPerDay" class="input" type="number" min="1" max="20" value="${bookingRules.maxPerDay || 3}"></div>
            <div><label class="input-label">Minimum notice (hours)</label><input id="br-minNotice" class="input" type="number" min="0" max="72" value="${bookingRules.minNoticeHours || 2}"></div>
            <div><label class="input-label">Max advance (days)</label><input id="br-maxAdvance" class="input" type="number" min="1" max="365" value="${bookingRules.maxAdvanceDays || 60}"></div>
            <div><label class="input-label">Buffer between slots (minutes)</label><input id="br-buffer" class="input" type="number" min="0" max="120" value="${bookingRules.bufferMinutes || 15}"></div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">Booking Link</div>
          <p style="font-size:0.875rem;color:#8A8993;margin-bottom:8px;">Share this link for people to book time with you:</p>
          <div style="display:flex;gap:4px;">
            <input class="input" value="https://book.example.com/${esc(state.user?.uid || 'you')}/first-event" readonly style="font-size:0.75rem;">
            <button class="btn btn-ghost btn-sm" onclick="${fn.copyBookingLink}()" style="flex-shrink:0;">${icon.copy}</button>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderMonthDays(grid) {
  if (!grid || !grid.length) {
    return html`<div style="grid-column:1/-1;text-align:center;padding:32px 0;color:#8A8993;font-size:0.875rem;">No availability data for this month. Set your working hours to generate time slots.</div>`
  }
  return grid.flat().map(cell => {
    if (!cell) return html`<div></div>`
    const isAvailable = cell.hasSlots
    const isToday = cell.isToday
    return html`
      <div style="padding:8px 4px;border-radius:10px;font-size:0.875rem;${isToday ? 'background:#7047EB;color:#fff;font-weight:600;' : isAvailable ? 'background:rgba(112,71,235,0.12);font-weight:600;' : 'color:#8A8993;'}">
        ${cell.day || ''}
      </div>
    `
  }).join('')
}
export function createAvailability({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return availabilityView({ state, fn }) },
    state: {
      availabilityError: '',
      bookingRules: {},
      error: '',
      loading: true,
      monthGrid: {},
      saving: false,
      user: null,
      workingHours: {}
    },
    methods: {
      _toggleDay(day) {
        const wh = { ...ctrl.getState().workingHours }
        wh[day] = wh[day] ? { ...wh[day], enabled: !wh[day].enabled } : { enabled: true, start: '09:00', end: '17:00' }
        ctrl.render({ workingHours: wh })
      },
      copyBookingLink() {
        const state = ctrl.getState()
        const link = 'https://book.example.com/' + (state.user?.uid || 'you') + '/first-event'
        if (navigator.clipboard) {
          navigator.clipboard.writeText(link).catch(() => {})
        }
      },
      saveAvailability() {
        ctrl.render({ saving: true })
        const uid = ctrl.getState().user?.uid
        if (!uid) {
          ctrl.render({ saving: false, availabilityError: 'Not authenticated' })
          return
        }
        const workingHours = ctrl.getState().workingHours || {}
        const bookingRules = {}
        const maxPerDay = ctrl.$('br-maxPerDay')?.value
        const minNotice = ctrl.$('br-minNotice')?.value
        const maxAdvance = ctrl.$('br-maxAdvance')?.value
        const buffer = ctrl.$('br-buffer')?.value
        if (maxPerDay) bookingRules.maxPerDay = parseInt(maxPerDay)
        if (minNotice) bookingRules.minNoticeHours = parseInt(minNotice)
        if (maxAdvance) bookingRules.maxAdvanceDays = parseInt(maxAdvance)
        if (buffer) bookingRules.bufferMinutes = parseInt(buffer)
        dbUpdate(dbRef(`/booking_rules/${uid}`), { workingHours, bookingRules, updatedAt: new Date().toISOString() })
          .unwrap()
          .then(() => ctrl.render({ saving: false, availabilityError: '' }))
          .catch(e => {
            console.error('[availability] save error:', e)
            ctrl.render({ saving: false, availabilityError: e.message || 'Save failed' })
          })
      }
    },
  })
    ctrl.load = async function () {
    const uid = ctrl.getState().user?.uid
    if (!uid) { ctrl.render({ loading: true }); return }
    try {
      const [snap, err] = await dbRead(dbRef(`/availability/${uid}`)).unwrap()
      if (err) throw err
      const data = snap ? (snap.val ? snap.val() : snap) : {}
      // Build monthGrid from availability data
      const monthGrid = {}
      const workingHours = {}
      for (const [date, slots] of Object.entries(data || {})) {
        monthGrid[date] = Object.values(slots || {})
      }
      // Default working hours
      for (const day of ['mon','tue','wed','thu','fri']) {
        workingHours[day] = { enabled: true, start: '09:00', end: '17:00' }
      }
      ctrl.render({ monthGrid, workingHours, loading: true, error: '' })
    } catch (e) {
      console.error('[availability] load error:', e)
      ctrl.render({ loading: true, error: e.message || 'Failed to load availability' })
    }
  }
  return ctrl
}
