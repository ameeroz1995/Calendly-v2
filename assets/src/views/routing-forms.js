/**
 * routing-forms.js — Routing forms list + builder view.
 *
 * States: loading | list | building | preview | saving | error
 */

import { controller, html, esc } from '../controller.js'
import { skeletonCards } from '../components/skeleton-card.js'
import { badge } from '../components/badge.js'
import { icon } from '../utils/icons.js'

const QUESTION_TYPES = [
  { id: 'text', label: 'Text' },
  { id: 'select', label: 'Multiple Choice' },
  { id: 'radio', label: 'Single Choice' },
  { id: 'checkbox', label: 'Checkboxes' },
]

export function routingFormsView({ state, fn }) {
  // ── Error ────────────────────────────────────────────────────
  if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading routing forms</div>
      <div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div>
      <button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button>
    </div>`
  }

  // ── Loading ──────────────────────────────────────────────────
  if (state.loading) return html`<div>${skeletonCards(3)}</div>`

  const forms = state.routingForms || []
  const mode = state.routingMode || 'list' // 'list' | 'building' | 'preview'
  const builderForm = state.builderForm || null
  const pools = state.pools || []
  const isSaving = state.saving === true

  // ── Preview mode ─────────────────────────────────────────────
  if (mode === 'preview' && builderForm) {
    return renderPreview(state, fn, builderForm)
  }

  // ── Builder mode ─────────────────────────────────────────────
  if (mode === 'building') {
    return renderBuilder(state, fn, builderForm, pools, isSaving)
  }

  // ── List mode ────────────────────────────────────────────────
  return html`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
      <div><h2>Routing Forms</h2><p style="color:#8A8993;font-size:0.875rem;">Qualify and route leads based on their answers</p></div>
      <button class="btn btn-primary btn-sm" onclick="${fn.createForm}()">${icon.plus} New Form</button>
    </div>

    ${state.saveError ? html`<div class="card" style="border-left:3px solid #FF4A5A;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      <span style="color:#FF4A5A;">${icon.alert}</span>
      <span style="color:#F4F3F6;font-size:0.875rem;">${esc(state.saveError)}</span>
    </div>` : ''}

    ${forms.length === 0 ? html`
      <div class="empty-state">
        <div style="font-size:48px;margin-bottom:16px;">${icon.webhook}</div>
        <div class="empty-state-title">No routing forms</div>
        <div class="empty-state-desc">Create a routing form to qualify and route leads to the right team member.</div>
        <button class="btn btn-primary btn-sm" onclick="${fn.createForm}()">${icon.plus} Create Routing Form</button>
      </div>
    ` : html`
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${forms.map(f => html`
          <div class="card fade-in" style="cursor:pointer;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-weight:600;">${esc(f.name)}</div>
                <div style="font-size:0.875rem;color:#8A8993;margin-top:4px;">
                  ${(f.questions || []).length} question${f.questions?.length !== 1 ? 's' : ''} · ${(f.rules || []).length} rule${f.rules?.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div style="display:flex;gap:4px;align-items:center;">
                ${badge(f.active ? 'info' : 'neutral', f.active ? 'Active' : 'Draft')}
                <button class="btn btn-ghost btn-sm" onclick="${fn.editForm}('${esc(f.fid)}')" style="font-size:0.75rem;min-height:32px;">${icon.edit}</button>
                <button class="btn btn-ghost btn-sm" onclick="${fn.previewForm}('${esc(f.fid)}')" style="font-size:0.75rem;min-height:32px;">${icon.eye}</button>
                <button class="btn btn-ghost btn-sm" onclick="${fn.deleteForm}('${esc(f.fid)}')" style="color:#FF4A5A;font-size:0.75rem;min-height:32px;">${icon.trash}</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `
}

// ── Builder ──────────────────────────────────────────────────────

function renderBuilder(state, fn, form, pools, isSaving) {
  const questions = form?.questions || []
  const rules = form?.rules || []

  return html`
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
      <button class="btn btn-ghost btn-sm" onclick="${fn.closeBuilder}()">${icon.chevronLeft} Back</button>
      <h2>${form?.fid ? 'Edit' : 'New'} Routing Form</h2>
    </div>

    ${state.saveError ? html`<div class="card" style="border-left:3px solid #FF4A5A;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      <span style="color:#FF4A5A;">${icon.alert}</span>
      <span style="color:#F4F3F6;font-size:0.875rem;">${esc(state.saveError)}</span>
    </div>` : ''}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">

      <!-- Left: Questions -->
      <div class="card">
        <div class="card-header">Form Name</div>
        <input id="rf-name" class="input" value="${esc(form?.name || '')}" placeholder="e.g. Sales Qualification" ${isSaving ? 'disabled' : ''} style="margin-bottom:12px;">

        <div class="card-header">Questions</div>
        ${questions.map((q, qi) => html`
          <div class="card fade-in" style="margin-bottom:8px;padding:12px;border-left:3px solid #7047EB;">
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
              <input class="input" value="${esc(q.label || '')}" placeholder="Question text" style="flex:1;" ${isSaving ? 'disabled' : ''} oninput="${fn._updateQuestion}(${qi}, 'label')">
              <select class="select" style="width:140px;" onchange="${fn._updateQuestion}(${qi}, 'type')" ${isSaving ? 'disabled' : ''}>
                ${QUESTION_TYPES.map(t => html`<option value="${t.id}" ${q.type === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}
              </select>
            </div>
            ${q.type === 'select' || q.type === 'radio' ? html`
              <div style="margin-bottom:8px;">
                ${(q.options || []).map((opt, oi) => html`
                  <div style="display:flex;gap:4px;align-items:center;margin-bottom:4px;">
                    <input class="input" value="${esc(opt)}" placeholder="Option ${oi + 1}" style="flex:1;" ${isSaving ? 'disabled' : ''}>
                    <button class="btn btn-ghost btn-sm" style="color:#FF4A5A;min-height:28px;padding:2px 6px;" onclick="${fn._removeOption}(${qi}, ${oi})" ${isSaving ? 'disabled' : ''}>${icon.x}</button>
                  </div>
                `).join('')}
                <button class="btn btn-ghost btn-sm" onclick="${fn._addOption}(${qi})" style="font-size:0.75rem;" ${isSaving ? 'disabled' : ''}>+ Add Option</button>
              </div>
            ` : ''}
            <div style="display:flex;gap:4px;">
              ${qi > 0 ? html`<button class="btn btn-ghost btn-sm" onclick="${fn._moveQuestionUp}(${qi})" style="font-size:0.75rem;min-height:28px;" ${isSaving ? 'disabled' : ''}>↑ Up</button>` : ''}
              ${qi < questions.length - 1 ? html`<button class="btn btn-ghost btn-sm" onclick="${fn._moveQuestionDown}(${qi})" style="font-size:0.75rem;min-height:28px;" ${isSaving ? 'disabled' : ''}>↓ Down</button>` : ''}
              <span style="flex:1;"></span>
              <button class="btn btn-ghost btn-sm" onclick="${fn._removeQuestion}(${qi})" style="color:#FF4A5A;font-size:0.75rem;min-height:28px;" ${isSaving ? 'disabled' : ''}>${icon.trash} Remove</button>
            </div>
            <label style="display:flex;align-items:center;gap:4px;margin-top:8px;font-size:0.75rem;color:#8A8993;">
              <input type="checkbox" ${q.required ? 'checked' : ''} onchange="${fn._toggleRequired}(${qi})" ${isSaving ? 'disabled' : ''}> Required
            </label>
          </div>
        `).join('')}
        <button class="btn btn-ghost btn-sm" onclick="${fn._addQuestion}()" style="width:100%;" ${isSaving ? 'disabled' : ''}>${icon.plus} Add Question</button>
      </div>

      <!-- Right: Routing Rules -->
      <div class="card">
        <div class="card-header">Routing Rules</div>
        <p style="font-size:0.875rem;color:#8A8993;margin-bottom:12px;">Define where leads go based on their answers. Rules are evaluated top-to-bottom; first match wins.</p>

        ${rules.map((r, ri) => html`
          <div class="card fade-in" style="margin-bottom:8px;padding:12px;border-left:3px solid #00C48C;">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <span style="font-size:0.875rem;">If</span>
              <select class="select" style="width:auto;flex:1;min-width:120px;" onchange="${fn._updateRule}(${ri}, 'questionIndex')" ${isSaving ? 'disabled' : ''}>
                ${questions.map((q, qi) => html`<option value="${qi}" ${r.questionIndex === qi ? 'selected' : ''}>${esc(q.label || 'Q' + (qi + 1))}</option>`).join('')}
              </select>
              <select class="select" style="width:auto;min-width:70px;" onchange="${fn._updateRule}(${ri}, 'operator')" ${isSaving ? 'disabled' : ''}>
                <option value="equals" ${r.operator === 'equals' ? 'selected' : ''}>=</option>
                <option value="not_equals" ${r.operator === 'not_equals' ? 'selected' : ''}>≠</option>
                <option value="contains" ${r.operator === 'contains' ? 'selected' : ''}>contains</option>
              </select>
              <input class="input" value="${esc(r.answer || '')}" placeholder="Answer" style="width:auto;flex:1;min-width:100px;" ${isSaving ? 'disabled' : ''} oninput="${fn._updateRule}(${ri}, 'answer')">
              <span style="font-size:0.875rem;">→ route to</span>
              <select class="select" style="width:auto;flex:1;min-width:120px;" onchange="${fn._updateRule}(${ri}, 'poolId')" ${isSaving ? 'disabled' : ''}>
                <option value="">Select pool</option>
                ${pools.map(p => html`<option value="${p.pid}" ${r.poolId === p.pid ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
              </select>
              <button class="btn btn-ghost btn-sm" onclick="${fn._removeRule}(${ri})" style="color:#FF4A5A;min-height:28px;" ${isSaving ? 'disabled' : ''}>${icon.x}</button>
            </div>
          </div>
        `).join('')}
        <button class="btn btn-ghost btn-sm" onclick="${fn._addRule}()" style="width:100%;" ${isSaving || questions.length === 0 ? 'disabled' : ''} title="${questions.length === 0 ? 'Add questions first' : ''}">${icon.plus} Add Rule</button>

        ${rules.length === 0 ? html`<p style="text-align:center;padding:16px;color:#8A8993;font-size:0.875rem;">No routing rules yet. Add questions first, then create rules.</p>` : ''}
      </div>
    </div>

    <!-- Action buttons -->
    <div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end;">
      <button class="btn btn-ghost btn-sm" onclick="${fn.previewFormBuilder}()" ${isSaving || questions.length === 0 ? 'disabled' : ''}>${icon.eye} Preview</button>
      <button class="btn btn-primary" onclick="${fn.saveForm}()" ${isSaving ? 'disabled' : ''}>
        ${isSaving ? html`${icon.spinner} Saving...` : 'Save Form'}
      </button>
    </div>
  `
}

// ── Preview ──────────────────────────────────────────────────────

function renderPreview(state, fn, form) {
  const questions = form?.questions || []

  return html`
    <div style="max-width:640px;margin:0 auto;">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
        <button class="btn btn-ghost btn-sm" onclick="${fn.closePreview}()">${icon.chevronLeft} Back to Editor</button>
        <h2>Preview: ${esc(form?.name || 'Form')}</h2>
        <span class="badge badge-info" style="margin-left:auto;">Preview Mode</span>
      </div>

      <div class="card" style="padding:32px;">
        <h2 style="text-align:center;margin-bottom:24px;">${esc(form?.name || 'Form')}</h2>
        ${questions.map((q, qi) => html`
          <div style="margin-bottom:16px;">
            <label class="input-label">${esc(q.label || 'Question ' + (qi + 1))} ${q.required ? '<span style="color:#FF4A5A;">*</span>' : ''}</label>
            ${q.type === 'text' ? html`<input class="input" placeholder="Your answer" disabled>`
            : q.type === 'select' ? html`<select class="select" disabled>${(q.options || []).map(o => html`<option>${esc(o)}</option>`).join('')}</select>`
            : q.type === 'radio' ? html`<div style="display:flex;flex-direction:column;gap:6px;">${(q.options || []).map(o => html`<label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="radio" name="preview-q-${qi}" disabled> ${esc(o)}</label>`).join('')}</div>`
            : q.type === 'checkbox' ? html`<div style="display:flex;flex-direction:column;gap:6px;">${(q.options || []).map(o => html`<label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" disabled> ${esc(o)}</label>`).join('')}</div>`
            : ''}
          </div>
        `).join('')}
        <button class="btn btn-primary btn-lg" style="width:100%;" disabled>Submit</button>
      </div>
    </div>
  `
}
export function createRoutingForms({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return routingFormsView({ state, fn }) },
    state: {
      builderForm: {},
      error: '',
      loading: false,
      pools: [],
      routingForms: [],
      routingMode: '',
      saveError: '',
      saving: false
    },
    methods: {
      createForm() {
        ctrl.render({ routingMode: 'building', builderForm: { fid: '', name: '', active: true, questions: [], rules: [] } })
      },
      editForm(fid) {
        const forms = ctrl.getState().routingForms || []
        const form = forms.find(f => f.fid === fid)
        if (form) ctrl.render({ routingMode: 'building', builderForm: { ...form } })
      },
      deleteForm(fid) {
        const routingForms = (ctrl.getState().routingForms || []).filter(f => f.fid !== fid)
        ctrl.render({ routingForms })
      },
      closeBuilder() {
        ctrl.render({ routingMode: 'list', builderForm: null })
      },
      saveForm() {
        const state = ctrl.getState()
        const form = state.builderForm
        if (!form) return
        const name = (document.getElementById('rf-name')?.value || '').trim()
        if (!name) { ctrl.render({ saveError: 'Form name is required' }); return }
        const now = new Date().toISOString()
        const saved = { ...form, name, updatedAt: now }
        if (!saved.fid) {
          saved.fid = 'rf_' + Math.random().toString(36).slice(2, 8)
          saved.createdAt = now
        }
        const routingForms = [...(state.routingForms || [])]
        const idx = routingForms.findIndex(f => f.fid === saved.fid)
        if (idx >= 0) routingForms[idx] = saved
        else routingForms.push(saved)
        ctrl.render({ routingForms, routingMode: 'list', builderForm: null, saveError: '', saving: false })
      },
      previewForm(fid) {
        const forms = ctrl.getState().routingForms || []
        const form = forms.find(f => f.fid === fid)
        if (form) ctrl.render({ routingMode: 'preview', builderForm: { ...form } })
      },
      previewFormBuilder() { ctrl.render({ routingMode: 'preview' }) },
      closePreview() { ctrl.render({ routingMode: 'building' }) },
      _addQuestion() {
        const form = { ...ctrl.getState().builderForm }
        const questions = [...(form.questions || []), { type: 'text', label: '', required: false }]
        ctrl.render({ builderForm: { ...form, questions } })
      },
      _removeQuestion(qi) {
        const form = { ...ctrl.getState().builderForm }
        const questions = (form.questions || []).filter((_, i) => i !== qi)
        ctrl.render({ builderForm: { ...form, questions } })
      },
      _moveQuestionUp(qi) {
        if (qi <= 0) return
        const form = { ...ctrl.getState().builderForm }
        const questions = [...(form.questions || [])]
        ;[questions[qi - 1], questions[qi]] = [questions[qi], questions[qi - 1]]
        ctrl.render({ builderForm: { ...form, questions } })
      },
      _moveQuestionDown(qi) {
        const form = { ...ctrl.getState().builderForm }
        const questions = form.questions || []
        if (qi >= questions.length - 1) return
        const swapped = [...questions]
        ;[swapped[qi], swapped[qi + 1]] = [swapped[qi + 1], swapped[qi]]
        ctrl.render({ builderForm: { ...form, questions: swapped } })
      },
      _updateQuestion(qi, field) {
        const form = { ...ctrl.getState().builderForm }
        const questions = [...(form.questions || [])]
        if (!questions[qi]) return
        // Read from DOM inputs that target this question
        const selectEl = document.querySelector(`select[onchange*="_updateQuestion(${qi}, 'type')"]`)
        const inputEl = document.querySelector(`input[oninput*="_updateQuestion(${qi}, 'label')"]`)
        const value = field === 'type' ? (selectEl?.value || 'text') : (inputEl?.value || '')
        questions[qi] = { ...questions[qi], [field]: value }
        ctrl.render({ builderForm: { ...form, questions } })
      },
      _addOption(qi) {
        const form = { ...ctrl.getState().builderForm }
        const questions = [...(form.questions || [])]
        if (!questions[qi]) return
        const options = [...(questions[qi].options || []), '']
        questions[qi] = { ...questions[qi], options }
        ctrl.render({ builderForm: { ...form, questions } })
      },
      _removeOption(qi, oi) {
        const form = { ...ctrl.getState().builderForm }
        const questions = [...(form.questions || [])]
        if (!questions[qi]) return
        const options = (questions[qi].options || []).filter((_, i) => i !== oi)
        questions[qi] = { ...questions[qi], options }
        ctrl.render({ builderForm: { ...form, questions } })
      },
      _addRule() {
        const form = { ...ctrl.getState().builderForm }
        const rules = [...(form.rules || []), { questionIndex: 0, answer: '', action: 'assign', targetPoolId: '' }]
        ctrl.render({ builderForm: { ...form, rules } })
      },
      _removeRule(ri) {
        const form = { ...ctrl.getState().builderForm }
        const rules = (form.rules || []).filter((_, i) => i !== ri)
        ctrl.render({ builderForm: { ...form, rules } })
      },
      _updateRule(ri, field) {
        const form = { ...ctrl.getState().builderForm }
        const rules = [...(form.rules || [])]
        if (!rules[ri]) return
        const el = document.querySelector(`[oninput*="_updateRule(${ri}, '${field}')"]`)
        rules[ri] = { ...rules[ri], [field]: el?.value || '' }
        ctrl.render({ builderForm: { ...form, rules } })
      },
      _toggleRequired() {},
    },
  })
  return ctrl
}
