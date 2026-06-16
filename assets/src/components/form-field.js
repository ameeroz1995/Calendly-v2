/**
 * form-field.js — Dynamic form field renderer (controller).
 *
 * Renders any field type: text, email, textarea, select, checkbox, radio.
 * Supports label, required indicator, error message.
 *
 * Usage:
 *   import { createFormField, formField } from './components/form-field.js'
 *   const ff = createFormField({ field: { type:'text', label:'Name', required:true }, value: '', errors: {} })
 *   parent uses: html`${ff}`
 *
 *   // Backward compat (returns toString() directly):
 *   html`${formField({ type:'text', label:'Name', required:true }, '', {})}`
 */

import { controller, html, esc } from '../controller.js'

/**
 * Create a form-field controller.
 * @param {Object} opts
 * @param {Object} opts.field — { id, type, label, required, options, placeholder, rows }
 * @param {*} [opts.value=''] — current field value
 * @param {Object} [opts.errors={}] — { [fieldId]: string } error messages map
 * @returns {Object} controller
 */
export function createFormField({ field = {}, value = '', errors = {} } = {}) {
  const { id, type = 'text', label, required, options, placeholder, rows = 3 } = field
  const fid = id || (label || 'field').toLowerCase().replace(/\s+/g, '-')

  const ctrl = controller({
    template({ state }) {
      const errorMsg = (state.errors || {})[fid] || ''
      const hasError = !!errorMsg
      const val = state.value ?? ''

      const labelHtml = label ? html`
        <label class="input-label" for="${fid}">
          ${esc(label)}${required ? ' <span style="color:#FF4A5A;">*</span>' : ''}
        </label>
      ` : ''

      const errorHtml = hasError ? html`<div class="input-error">${esc(errorMsg)}</div>` : ''

      let inputHtml = ''

      if (type === 'select') {
        inputHtml = html`
          <select id="${fid}" class="select" name="${fid}">
            ${(options || []).map(opt => html`
              <option value="${esc(opt.value)}" ${String(val) === String(opt.value) ? 'selected' : ''}>${esc(opt.label)}</option>
            `).join('')}
          </select>
        `
      } else if (type === 'textarea') {
        inputHtml = html`<textarea id="${fid}" class="input" name="${fid}" rows="${rows}" placeholder="${esc(placeholder || '')}" style="resize:vertical;">${esc(val)}</textarea>`
      } else if (type === 'checkbox') {
        inputHtml = html`
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.875rem;">
            <input id="${fid}" type="checkbox" name="${fid}" ${val ? 'checked' : ''} style="accent-color:#7047EB;">
            ${esc(label || '')}
          </label>
        `
      } else if (type === 'radio') {
        inputHtml = (options || []).map(opt => html`
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.875rem;margin-bottom:4px;">
            <input type="radio" name="${fid}" value="${esc(opt.value)}" ${String(val) === String(opt.value) ? 'checked' : ''} style="accent-color:#7047EB;">
            ${esc(opt.label)}
          </label>
        `).join('')
      } else {
        const inputType = type === 'email' ? 'email' : 'text'
        inputHtml = html`<input id="${fid}" type="${inputType}" class="input" name="${fid}" value="${esc(val)}" placeholder="${esc(placeholder || '')}">`
      }

      if (type === 'checkbox') {
        return html`<div id="formfield-root" style="margin-bottom:12px;">${inputHtml}${errorHtml}</div>`
      }

      return html`<div id="formfield-root" style="margin-bottom:12px;">${labelHtml}${inputHtml}${errorHtml}</div>`
    },
    state: { value, errors, field },
    methods: {
      setValue(v) { ctrl.render({ value: v }) },
      setErrors(e) { ctrl.render({ errors: e }) },
      setField(f) { ctrl.render({ field: f }) },
    },
  })
  return ctrl
}

/**
 * Backward-compatible shorthand — returns toString() result for inline use.
 * @param {Object} field
 * @param {*} [value='']
 * @param {Object} [errors={}]
 * @returns {string} HTML placeholder (data-cid)
 */
const _cache = new Map()
export function formField(field, value = '', errors = {}) {
  const key = `${field?.id}|${value}`
  if (!_cache.has(key)) _cache.set(key, createFormField({ field, value, errors }).toString())
  return _cache.get(key)
}
