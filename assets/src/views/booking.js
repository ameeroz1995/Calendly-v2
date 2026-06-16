/**
 * booking.js — Public booking page (multi-step wizard).
 *
 * Route: /book/:hostId/:eventTypeId
 * Steps: date → slot → form → confirm → success
 * States: loading | date_select | slot_select | form | confirm | success | error |
 *         password_gate | slot_taken | event_deleted | no_availability
 *
 * Wizard state is persisted in sessionStorage so progress survives page reload.
 */

import { controller, html, esc } from '../controller.js'
import { icon } from '../utils/icons.js'
import { userAvatar } from '../components/user-avatar.js'
import { dbRef, dbRead } from '../db.js'

const STEPS = ['date_select', 'slot_select', 'form', 'confirm']
const STEP_LABELS = ['Select Date', 'Select Time', 'Your Info', 'Confirm']

// ── sessionStorage helpers ────────────────────────────────────────

const STORAGE_KEY = 'calendly_booking_wizard'

function loadWizardState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (_) {
    return null
  }
}

function saveWizardState(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (_) { /* storage full or unavailable */ }
}

function clearWizardState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch (_) { /* ignore */ }
}

// ── Main view ────────────────────────────────────────────────────

export function bookingView({ state, fn }) {
  // Restore wizard from sessionStorage on initial mount
  if (!state._wizardRestored) {
    const saved = loadWizardState()
    if (saved && saved.eventTypeId === state.currentParams?.eventTypeId) {
      // Defer restoring so the render cycle completes first
      if (fn.restoreWizard) fn.restoreWizard(saved)
    }
  }

  // ── Loading state ───────────────────────────────────────────
  if (state.loading) {
    return html`<div style="display:flex;align-items:center;justify-content:center;min-height:50vh;">
      <div style="text-align:center;color:#8A8993;">${icon.spinner}<div style="margin-top:8px;">Loading...</div></div>
    </div>`
  }

  // ── Error states ────────────────────────────────────────────
  if (state.bookingError) {
    const msg = state.bookingError
    if (msg === 'event_deleted') {
      return html`<div style="max-width:480px;margin:0 auto;"><div class="card" style="text-align:center;padding:32px;">
        <div style="font-size:48px;margin-bottom:16px;color:#FF4A5A;">${icon.alert}</div>
        <h2 style="margin-bottom:8px;">Event No Longer Available</h2>
        <p style="color:#8A8993;">This event type has been removed by the host.</p>
      </div></div>`
    }
    if (msg === 'no_availability') {
      return html`<div style="max-width:480px;margin:0 auto;"><div class="card" style="text-align:center;padding:32px;">
        <div style="font-size:48px;margin-bottom:16px;">${icon.calendar}</div>
        <h2 style="margin-bottom:8px;">No Availability</h2>
        <p style="color:#8A8993;">The host has no available time slots right now. Check back later.</p>
      </div></div>`
    }
    if (msg === 'slot_taken') {
      return html`<div style="max-width:480px;margin:0 auto;"><div class="card" style="text-align:center;padding:32px;">
        <div style="font-size:48px;margin-bottom:16px;color:#F5A623;">${icon.clock}</div>
        <h2 style="margin-bottom:8px;">Slot Just Taken</h2>
        <p style="color:#8A8993;margin-bottom:16px;">This time slot was just booked by someone else. Please choose another time.</p>
        <button class="btn btn-primary" onclick="${fn.setBookingStep}('date_select')">Choose Another Time</button>
      </div></div>`
    }
    if (msg === 'password_gate') {
      return html`<div style="max-width:480px;margin:0 auto;"><div class="card" style="text-align:center;padding:32px;">
        <div style="font-size:48px;margin-bottom:16px;">${icon.lock}</div>
        <h2 style="margin-bottom:8px;">Password Protected</h2>
        <p style="color:#8A8993;margin-bottom:16px;">Please enter the event password to continue.</p>
        <input id="booking-password" class="input" type="password" placeholder="Event password" style="margin-bottom:12px;">
        <button class="btn btn-primary" onclick="${fn.submitPassword}()">Submit</button>
      </div></div>`
    }
    // Generic error
    return html`<div style="max-width:480px;margin:0 auto;"><div class="card" style="text-align:center;padding:32px;">
      <div style="font-size:48px;margin-bottom:16px;color:#FF4A5A;">${icon.alert}</div>
      <h2 style="margin-bottom:8px;">Something went wrong</h2>
      <p style="color:#8A8993;">${esc(msg)}</p>
    </div></div>`
  }

  const step = state.bookingStep || 'date_select'
  const stepIndex = STEPS.indexOf(step)
  const eventType = state.bookingEventType || {}
  const host = state.bookingHost || {}
  const slots = state.bookingSlots || []
  const selectedDate = state.bookingSelectedDate || ''
  const selectedSlot = state.bookingSelectedSlot || ''
  const formData = state.bookingFormData || {}
  const confirmSuccess = state.bookingSuccess

  // ── Persist wizard state to sessionStorage on each render ───
  if (fn._persistWizard) {
    fn._persistWizard({ step, selectedDate, selectedSlot, formData, eventTypeId: eventType.id })
  }

  // ── Success state ───────────────────────────────────────────
  if (confirmSuccess) {
    clearWizardState()
    return html`
      <div style="max-width:480px;margin:0 auto;">
        <div class="card" style="text-align:center;padding:32px;">
          <div style="font-size:48px;margin-bottom:16px;color:#00C48C;">${icon.check}</div>
          <h2 style="margin-bottom:8px;">Booking Confirmed!</h2>
          <p style="color:#8A8993;margin-bottom:8px;">${esc(eventType.title)} with ${esc(host.name || 'host')}</p>
          <p style="color:#8A8993;">${esc(selectedDate)} at ${esc(selectedSlot)}</p>
          <p style="color:#8A8993;margin-top:12px;font-size:0.875rem;">A confirmation has been sent to your email.</p>
        </div>
      </div>`
  }

  // ── Main wizard ─────────────────────────────────────────────
  return html`
    <div style="max-width:480px;margin:0 auto;">
      <div class="card" style="text-align:center;padding:32px;">
        <div style="width:48px;height:48px;border-radius:12px;background:#7047EB;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Geist',sans-serif;font-weight:700;font-size:20px;margin:0 auto 16px;">C</div>
        <h2>${esc(eventType.title || 'Book a Meeting')}</h2>
        <p style="color:#8A8993;margin-bottom:4px;">${esc(String(eventType.duration || 30))} min · ${esc(eventType.location || 'Video call')}</p>
        ${host.name ? html`<div style="margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px;">${userAvatar(host, 'sm')}<span style="font-size:0.875rem;color:#8A8993;">${esc(host.name)}</span></div>` : ''}

        <!-- Step indicator -->
        <div class="wizard-steps" style="margin-bottom:24px;">
          ${STEPS.map((s, i) => {
            const isActive = i === stepIndex
            const isDone = i < stepIndex
            return html`<div class="wizard-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}">
              <div class="wizard-step-num">${isDone ? icon.check : i + 1}</div>
              <span>${STEP_LABELS[i]}</span>
            </div>${i < STEPS.length - 1 ? html`<div class="wizard-connector ${isDone ? 'done' : ''}"></div>` : ''}`
          }).join('')}
        </div>

        ${step === 'date_select' ? renderDateStep(state, fn, slots, selectedDate) : ''}
        ${step === 'slot_select' ? renderSlotStep(state, fn, slots, selectedDate, selectedSlot) : ''}
        ${step === 'form' ? renderFormStep(state, fn, formData, eventType) : ''}
        ${step === 'confirm' ? renderConfirmStep(state, fn, formData, selectedDate, selectedSlot, eventType) : ''}
      </div>
    </div>
  `
}

// ── Step renderers ───────────────────────────────────────────────

function renderDateStep(state, fn, slots, selectedDate) {
  const dates = [...new Set(slots.map(s => s.date))].slice(0, 14)
  return html`
    <div style="text-align:left;">
      <label class="input-label">Select Date</label>
      ${dates.length === 0 ? html`<p style="color:#8A8993;padding:16px;text-align:center;">No available dates in the next 14 days.</p>` : ''}
      <div class="slot-grid" style="grid-template-columns:repeat(4,1fr);">
        ${dates.map(d => html`
          <button class="slot-btn${selectedDate === d ? ' selected' : ''}" onclick="${fn.selectBookingDate}('${esc(d)}')">${esc(d.slice(5))}</button>
        `).join('')}
      </div>
    </div>
  `
}

function renderSlotStep(state, fn, slots, selectedDate, selectedSlot) {
  const daySlots = slots.filter(s => s.date === selectedDate && s.status === 'free')
  return html`
    <div style="text-align:left;">
      <label class="input-label">Select Time — ${esc(selectedDate)}</label>
      <button class="btn btn-ghost btn-sm" onclick="${fn.setBookingStep}('date_select')" style="margin-bottom:8px;">← Change date</button>
      ${daySlots.length === 0 ? html`<p style="color:#8A8993;padding:16px;text-align:center;">No available times on this date.</p>` : ''}
      <div class="slot-grid">
        ${daySlots.map(s => html`
          <button class="slot-btn${selectedSlot === s.iso ? ' selected' : ''}" onclick="${fn.selectBookingSlot}('${esc(s.iso)}')">${esc(s.time)}</button>
        `).join('')}
      </div>
    </div>
  `
}

function renderFormStep(state, fn, formData, eventType) {
  const fields = eventType.formFields || [
    { id: 'name', label: 'Your Name', type: 'text', required: true },
    { id: 'email', label: 'Email', type: 'email', required: true },
  ]
  return html`
    <div style="text-align:left;">
      <button class="btn btn-ghost btn-sm" onclick="${fn.setBookingStep}('slot_select')" style="margin-bottom:12px;">← Change time</button>
      ${fields.map(f => html`
        <div style="margin-bottom:12px;">
          <label class="input-label">${esc(f.label)} ${f.required ? '<span style="color:#FF4A5A;">*</span>' : ''}</label>
          ${f.type === 'textarea' ? html`<textarea id="bf-${esc(f.id)}" class="input" rows="3" placeholder="${esc(f.placeholder || '')}" style="resize:vertical;">${esc(formData[f.id] || '')}</textarea>`
          : html`<input id="bf-${esc(f.id)}" class="input" type="${f.type === 'email' ? 'email' : 'text'}" value="${esc(formData[f.id] || '')}" placeholder="${esc(f.placeholder || '')}">`}
        </div>
      `).join('')}
      <button class="btn btn-primary btn-lg" onclick="${fn.confirmBooking}()" style="width:100%;">Continue</button>
    </div>
  `
}

function renderConfirmStep(state, fn, formData, selectedDate, selectedSlot, eventType) {
  return html`
    <div style="text-align:left;">
      <h3 style="margin-bottom:16px;">Confirm Your Booking</h3>
      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#8A8993;">Event</span><span>${esc(eventType.title)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#8A8993;">Date</span><span>${esc(selectedDate)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#8A8993;">Time</span><span>${esc(selectedSlot)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#8A8993;">Duration</span><span>${esc(String(eventType.duration || 30))} min</span></div>
        ${formData.name ? html`<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#8A8993;">Name</span><span>${esc(formData.name)}</span></div>` : ''}
        ${formData.email ? html`<div style="display:flex;justify-content:space-between;"><span style="color:#8A8993;">Email</span><span>${esc(formData.email)}</span></div>` : ''}
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost btn-sm" onclick="${fn.setBookingStep}('form')">← Back</button>
        <button class="btn btn-primary btn-lg" onclick="${fn.submitBooking}()" style="flex:1;">Confirm Booking</button>
      </div>
    </div>
  `
}

// Re-export helpers for the controller
export { loadWizardState, saveWizardState, clearWizardState }
export function createBooking({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return bookingView({ state, fn }) },
    state: {
      _wizardRestored: false,
      bookingError: '',
      bookingEventType: {},
      bookingFormData: {},
      bookingHost: {},
      bookingSelectedDate: '',
      bookingSelectedSlot: '',
      bookingSlots: [],
      bookingStep: '',
      bookingSuccess: false,
      currentParams: {},
      loading: true
    },
    methods: {
      setBookingStep(step) {
        ctrl.render({ bookingStep: step, bookingError: '' })
      },
      selectBookingDate(date) {
        saveWizardState({ ...ctrl.getState(), bookingSelectedDate: date })
        ctrl.render({ bookingSelectedDate: date, bookingStep: 'slot_select' })
      },
      selectBookingSlot(iso) {
        const state = ctrl.getState()
        saveWizardState({ ...state, bookingSelectedSlot: iso })
        ctrl.render({ bookingSelectedSlot: iso, bookingStep: 'form' })
      },
      confirmBooking() {
        // Read form fields from DOM (they use id="bf-{fieldId}")
        const state = ctrl.getState()
        const eventType = state.bookingEventType || {}
        const fields = eventType.formFields || [
          { id: 'name', type: 'text' },
          { id: 'email', type: 'email' },
        ]
        const formData = {}
        for (const f of fields) {
          const el = document.getElementById('bf-' + f.id)
          if (el) formData[f.id] = el.value || ''
        }
        ctrl.render({ bookingFormData: formData, bookingStep: 'confirm' })
      },
      submitBooking() {
        const state = ctrl.getState()
        ctrl.render({ loading: true, bookingError: '' })

        // Use the booking service via dynamic import (avoids circular deps)
        import('../services/booking.service.js').then(({ bookSlot }) => {
          return bookSlot(
            state.currentParams?.hostId || '',
            state.bookingSelectedDate,
            state.bookingSelectedSlot,
            state.user?.uid || null,
            {
              eventTypeId: state.currentParams?.eventTypeId || state.bookingEventType?.id || '',
              formData: state.bookingFormData || {},
              requiresPhi: false,
            }
          ).unwrap()
        }).then(([result, err]) => {
          if (err) {
            console.error('[booking] submit failed:', err)
            ctrl.render({ loading: true, bookingError: err.message || 'Booking failed' })
            return
          }
          clearWizardState()
          ctrl.render({ loading: true, bookingSuccess: true, bookingError: '' })
        }).catch(e => {
          console.error('[booking] unexpected error:', e)
          ctrl.render({ loading: true, bookingError: e.message || 'Unexpected error' })
        })
      },
      submitPassword() {
        const el = document.getElementById('booking-password')
        const password = el ? el.value : ''
        const eventType = ctrl.getState().bookingEventType || {}
        if (password && password === eventType.password) {
          ctrl.render({ bookingError: '', bookingStep: 'date_select' })
        } else {
          ctrl.render({ bookingError: 'Incorrect password' })
        }
      },
      restoreWizard(saved) {
        if (!saved) return
        ctrl.render({
          _wizardRestored: true,
          bookingStep: saved.step || 'date_select',
          bookingSelectedDate: saved.selectedDate || '',
          bookingSelectedSlot: saved.selectedSlot || '',
          bookingFormData: saved.formData || {},
        })
      },
      _persistWizard(data) {
        saveWizardState({ ...ctrl.getState(), ...data })
      },
    },
  })

  ctrl.load = async function () {
    const state = ctrl.getState()
    const hostId = state.currentParams?.hostId
    const eventTypeId = state.currentParams?.eventTypeId

    if (!hostId || !eventTypeId) {
      ctrl.render({ loading: true, bookingError: 'event_deleted' })
      return
    }

    ctrl.render({ loading: true, bookingError: '' })

    try {
      // Load event type
      const [etSnap, etErr] = await dbRead(dbRef(`/event_types/${hostId}/${eventTypeId}`)).unwrap()
      if (etErr) throw etErr
      const eventType = etSnap?.val ? etSnap.val() : etSnap
      if (!eventType || eventType.active === false) {
        ctrl.render({ loading: true, bookingError: 'event_deleted' })
        return
      }

      // Load host profile
      const [hostSnap, hostErr] = await dbRead(dbRef(`/users/${hostId}`)).unwrap()
      const host = hostErr ? {} : (hostSnap?.val ? hostSnap.val() : hostSnap || {})

      // Load available slots
      const [slotsSnap, slotsErr] = await dbRead(dbRef(`/availability/${hostId}`)).unwrap()
      let slots = []
      if (!slotsErr && slotsSnap) {
        const data = slotsSnap?.val ? slotsSnap.val() : slotsSnap
        for (const [, dateSlots] of Object.entries(data || {})) {
          for (const [, slot] of Object.entries(dateSlots || {})) {
            if (slot.status === 'free') slots.push(slot)
          }
        }
      }

      // Password gate check — shown as error state, not a step
      const needsPassword = !!eventType.password
      const hasSlots = slots.length > 0

      ctrl.render({
        loading: true,
        bookingEventType: eventType,
        bookingHost: host,
        bookingSlots: slots,
        bookingStep: 'date_select',
        bookingError: needsPassword ? 'password_gate'
          : !hasSlots ? 'no_availability'
          : '',
      })

      // Check sessionStorage for restored wizard state
      if (!state._wizardRestored) {
        const saved = loadWizardState()
        if (saved && saved.eventTypeId === eventTypeId) {
          ctrl.restoreWizard(saved)
        }
      }
    } catch (e) {
      console.error('[booking] load error:', e)
      ctrl.render({ loading: true, bookingError: e.message || 'Failed to load booking page' })
    }
  }

  return ctrl
}
