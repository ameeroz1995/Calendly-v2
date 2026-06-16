/**
 * booking-page-editor.js — Booking page editor (3-panel layout).
 *
 * States: loading | loaded | saving | error
 *
 * Left panel: block palette + layout switcher
 * Center: 375px live preview
 * Right: properties panel (title, description, color, button text)
 */

import { controller, html, esc } from '../controller.js'
import { icon } from '../utils/icons.js'

const BLOCKS = [
  { id: 'header', label: 'Header' },
  { id: 'description', label: 'Description' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'form', label: 'Form Fields' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'faq', label: 'FAQ' },
  { id: 'image', label: 'Image' },
  { id: 'spacer', label: 'Spacer' },
  { id: 'footer', label: 'Footer' },
]

const LAYOUTS = ['classic', 'modern', 'compact']

const COLORS = ['#7047EB', '#00C48C', '#FF4A5A', '#F5A623']

export function bookingPageEditorView({ state, fn }) {
  // ── Error state ─────────────────────────────────────────────
  if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Failed to load editor</div>
      <div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div>
      <button class="btn btn-primary" onclick="${fn.navigateTo}('/event-types')">← Back to Event Types</button>
    </div>`
  }

  // ── Loading state ───────────────────────────────────────────
  if (state.loading) {
    return html`<div style="text-align:center;padding:64px;">
      <div style="color:#8A8993;margin-bottom:16px;">${icon.spinner}</div>
      <div style="color:#8A8993;font-size:0.875rem;">Loading editor...</div>
    </div>`
  }

  // ── Data ────────────────────────────────────────────────────
  const pageConfig = state.pageConfig || {}
  const activeLayout = pageConfig.layout || 'modern'
  const primaryColor = pageConfig.primaryColor || '#7047EB'
  const eventType = state.currentEventType || state.editingEventType || {}
  const isSaving = state.saving === true

  // ── Main view ───────────────────────────────────────────────
  return html`
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap;">
      <button class="btn btn-ghost btn-sm" onclick="${fn.navigateTo}('/event-types')">${icon.chevronLeft} Back</button>
      <h2 style="margin:0;">Edit Booking Page</h2>
      ${eventType.title ? html`<span class="badge badge-info" style="font-size:0.75rem;">${esc(eventType.title)}</span>` : ''}
    </div>

    ${state.saveError ? html`<div class="card" style="border-left:3px solid #FF4A5A;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      <span style="color:#FF4A5A;">${icon.alert}</span>
      <span style="color:#F4F3F6;font-size:0.875rem;">${esc(state.saveError)}</span>
      <button class="btn btn-ghost btn-sm" style="margin-left:auto;color:#8A8993;" onclick="${fn.dismissSaveError}()">${icon.x}</button>
    </div>` : ''}

    <div style="display:grid;grid-template-columns:220px 1fr 260px;gap:16px;align-items:start;">

      <!-- ── Left: Block Palette ───────────────────────────── -->
      <div class="card" style="position:sticky;top:80px;">
        <div class="card-header">Blocks</div>
        <div style="display:flex;flex-direction:column;gap:2px;">
          ${BLOCKS.map(b => html`
            <button class="sidebar-nav-item" style="min-height:36px;color:#8A8993;font-size:0.875rem;" onclick="${fn.addBlock}('${esc(b.id)}')">
              ${esc(b.label)}
            </button>
          `).join('')}
        </div>
        <div style="margin-top:16px;">
          <div class="card-header">Layout</div>
          <div style="display:flex;gap:4px;">
            ${LAYOUTS.map(l => html`
              <button class="btn ${l === activeLayout ? 'btn-primary' : 'btn-ghost'} btn-sm"
                style="flex:1;text-transform:capitalize;"
                onclick="${fn.setLayout}('${l}')"
                ${isSaving ? 'disabled' : ''}>${esc(l)}</button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- ── Center: Live Preview ──────────────────────────── -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="background:#1A1923;padding:10px 16px;border-bottom:1px solid #262431;display:flex;align-items:center;gap:8px;">
          <span class="status-dot status-dot-green"></span>
          <span style="font-size:0.875rem;color:#8A8993;">Live Preview</span>
          <span style="margin-left:auto;font-size:0.75rem;color:#8A8993;">375px</span>
        </div>
        <div style="max-width:375px;margin:0 auto;padding:32px 20px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="width:48px;height:48px;border-radius:12px;background:${primaryColor};color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Geist',sans-serif;font-weight:700;font-size:20px;margin:0 auto 12px;">${esc((eventType.title || 'M')[0].toUpperCase())}</div>
            <div style="font-family:'Geist',sans-serif;font-weight:700;font-size:1.25rem;">${esc(eventType.title || 'Meeting')}</div>
            <div style="font-size:0.875rem;color:#8A8993;margin-top:4px;">${esc(String(eventType.duration || 30))} min</div>
          </div>
          <div style="background:#12111A;border:1px solid #262431;border-radius:10px;padding:16px;">
            <div style="font-size:0.875rem;color:#8A8993;margin-bottom:8px;">Select Date</div>
            <div class="slot-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:12px;">
              <button class="slot-btn selected">Jun 16</button><button class="slot-btn">Jun 17</button><button class="slot-btn">Jun 18</button><button class="slot-btn">Jun 19</button>
            </div>
            <div style="font-size:0.875rem;color:#8A8993;margin-bottom:8px;">Select Time</div>
            <div class="slot-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:12px;">
              <button class="slot-btn">9:00 AM</button><button class="slot-btn">10:30 AM</button><button class="slot-btn">2:00 PM</button>
            </div>
            <div style="font-size:0.875rem;color:#8A8993;margin-bottom:8px;">Your Info</div>
            <input class="input" placeholder="Full name" style="margin-bottom:8px;background:#1A1923;" disabled>
            <input class="input" placeholder="Email" style="margin-bottom:12px;background:#1A1923;" disabled>
            <button class="btn btn-primary btn-lg" style="width:100%;background:${primaryColor};" disabled>${esc(pageConfig.buttonText || 'Confirm Booking')}</button>
          </div>
          <div style="text-align:center;font-size:0.75rem;color:#8A8993;margin-top:12px;">Powered by Calendly v2</div>
        </div>
      </div>

      <!-- ── Right: Properties ─────────────────────────────── -->
      <div class="card" style="position:sticky;top:80px;">
        <div class="card-header">Properties</div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label class="input-label">Header Title</label>
            <input id="pe-title" class="input" value="${esc(pageConfig.headerTitle || eventType.title || '')}" ${isSaving ? 'disabled' : ''}>
          </div>
          <div>
            <label class="input-label">Description</label>
            <textarea id="pe-desc" class="input" rows="3" style="resize:vertical;" ${isSaving ? 'disabled' : ''}>${esc(pageConfig.description || '')}</textarea>
          </div>
          <div>
            <label class="input-label">Primary Color</label>
            <div style="display:flex;gap:6px;align-items:center;">
              ${COLORS.map(c => html`<button
                style="width:28px;height:28px;border-radius:6px;background:${c};border:2px solid ${c === primaryColor ? '#F4F3F6' : 'transparent'};cursor:pointer;"
                onclick="${fn.setColor}('${c}')"
                ${isSaving ? 'disabled' : ''}
                title="${esc(c)}"></button>`).join('')}
              <input type="color" value="${primaryColor}" style="width:28px;height:28px;border-radius:6px;cursor:pointer;border:none;" ${isSaving ? 'disabled' : ''}>
            </div>
          </div>
          <div>
            <label class="input-label">Button Text</label>
            <input id="pe-btn" class="input" value="${esc(pageConfig.buttonText || 'Confirm Booking')}" ${isSaving ? 'disabled' : ''}>
          </div>
          <button class="btn btn-primary" onclick="${fn.savePage}()" style="width:100%;" ${isSaving ? 'disabled' : ''}>
            ${isSaving ? html`${icon.spinner} Saving...` : 'Save Page'}
          </button>
          <button class="btn btn-ghost btn-sm" onclick="${fn.previewPage}()" style="width:100%;color:#7047EB;" ${isSaving ? 'disabled' : ''}>
            ${icon.eye} Open Preview
          </button>
        </div>
      </div>

    </div>
  `
}
export function createBookingPageEditor({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return bookingPageEditorView({ state, fn }) },
    state: {
      currentEventType: {},
      editingEventType: {},
      error: '',
      loading: false,
      pageConfig: {},
      saveError: '',
      saving: false
    },
    methods: {
      addBlock(bid) {
        const cfg = { ...ctrl.getState().pageConfig }
        const blocks = [...(cfg.blocks || []), { type: bid, config: {} }]
        ctrl.render({ pageConfig: { ...cfg, blocks } })
      },
      setLayout(layout) {
        const cfg = { ...ctrl.getState().pageConfig }
        ctrl.render({ pageConfig: { ...cfg, layout } })
      },
      setColor(color) {
        const cfg = { ...ctrl.getState().pageConfig }
        ctrl.render({ pageConfig: { ...cfg, primaryColor: color } })
      },
      savePage() {
        ctrl.render({ saving: true, saveError: '' })
        setTimeout(() => ctrl.render({ saving: false, saveError: '' }), 500)
      },
      previewPage() {
        // Open preview in new tab or modal
        window.open('#/event-types/editor?preview=1', '_blank')
      },
      dismissSaveError() {
        ctrl.render({ saveError: '' })
      }
    },
  })
  return ctrl
}
