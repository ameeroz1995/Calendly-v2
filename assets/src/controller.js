// morphdom is loaded via CDN in index.html — attaches to window.morphdom
const morphdom = window.morphdom

// ── Hoisted constants ──
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/**
 * HTML entity escaping for XSS prevention.
 * Wrap all user-controlled values in templates with esc().
 *
 * Usage: html`<h2>${esc(state.eventType.title)}</h2>`
 */
export const esc = (str) => {
  if (str === null || str === undefined) return ''
  return String(str).replace(/[&<>"']/g, c => ESC_MAP[c])
}

/**
 * Debounce utility — trailing-edge only.
 */
export const debounce = (func, wait = 300) => {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

/**
 * Tagged template literal for HTML strings.
 * Null/undefined/booleans become empty. Arrays are joined.
 */
export const html = (strings, ...values) => {
  return strings.reduce((acc, str, i) => {
    let val = values[i]
    if (val === null || val === undefined || typeof val === 'boolean') val = ''
    else if (Array.isArray(val)) val = val.join('')
    return acc + str + val
  }, '')
}

/**
 * Core Controller Factory
 *
 * API:
 *   const ctrl = controller({ template, state, methods })
 *
 *   - `template({ state, fn })` returns the full HTML string
 *   - `state` is the initial application state
 *   - `methods` are registered on the global bridge for onclick="${fn.method}()"
 *   - All elements with id="..." are auto-onboarded → ctrl['my-id'] or ctrl.myId
 *   - `ctrl.render(patch)` merges patch into state, re-renders, re-onboards
 */
export function controller(opts = {}) {
  const { template, state: initialState, methods } = opts

  // ── Auto-UID ──
  const uid = 'c' + Math.random().toString(36).slice(2, 8)

  // ── Global handler bridge + element registry ──
  window.__app = window.__app || {}
  window.__app[uid] = {}
  window.__el  = window.__el  || {}

  // ── fn proxy: transpiles ctrl.fn.method to global bridge string ──
  const fnProxy = new Proxy({}, {
    get(_, methodName) {
      if (typeof methodName === 'symbol') return undefined
      return `__app['${uid}'].${String(methodName)}`
    }
  })

  // ── Internal storage ───────────────────────────────────────
  // _state = application data only (passed to template)
  // _els   = DOM element references (keyed by id)
  // These are deliberately SEPARATE so an element id="submit" never
  // collides with state property { submit: true }.
  let _state = {}
  let _els   = {}
  let _triggers     = {}  // id → [{ type, cb }] desired bindings
  let _boundTriggers = {} // id → Set(cb) currently bound (prevents duplicates)
  let _unsubs       = []
  let _queue        = {}
  let _store        = {}
  let _timeouts     = []

  // ── Morphdom config (preserves input/select/textarea values) ──
  const morphOpts = {
    onBeforeElUpdated(fromEl, toEl) {
      if (fromEl.isEqualNode(toEl)) return false
      if (fromEl.tagName === 'INPUT' && toEl.tagName === 'INPUT') {
        if (fromEl.type === 'checkbox' || fromEl.type === 'radio') {
          toEl.checked = fromEl.checked
        } else {
          toEl.value = fromEl.value
        }
      }
      if (fromEl.tagName === 'TEXTAREA' && toEl.tagName === 'TEXTAREA') toEl.value = fromEl.value
      if (fromEl.tagName === 'SELECT' && toEl.tagName === 'SELECT') toEl.value = fromEl.value
      return true
    }
  }

  // ── Element tracking ──────────────────────────────────────
  function track(id, el) {
    _els[id] = el
  }

  // ── Trigger binding (idempotent — never double-binds) ─────
  function rebindTriggers() {
    Object.keys(_triggers).forEach(id => {
      const el = _els[id]
      if (!el) return
      let bound = _boundTriggers[id]
      if (!bound) { bound = new Set(); _boundTriggers[id] = bound }
      _triggers[id].forEach(t => {
        if (!bound.has(t.cb)) {
          el.addEventListener(t.type, t.cb)
          bound.add(t.cb)
        }
      })
    })
  }

  function unbindAllTriggers() {
    Object.keys(_triggers).forEach(id => {
      const el = _els[id]
      if (el && _boundTriggers[id]) {
        _triggers[id].forEach(t => {
          if (_boundTriggers[id].has(t.cb)) {
            el.removeEventListener(t.type, t.cb)
            _boundTriggers[id].delete(t.cb)
          }
        })
      }
    })
  }

  // ── Auto-onboard: discover all id elements ─────────────────
  function autoOnboard(el) {
    if (el.id) track(el.id, el)
    el.querySelectorAll('[id]').forEach(child => track(child.id, child))
  }

  // ── Build root from template ──────────────────────────────
  function buildRoot(tplState) {
    const htmlStr = template({ state: tplState, fn: fnProxy })
    const temp = document.createElement('div')
    temp.innerHTML = htmlStr.trim()

    const children = [...temp.children]
    let el

    if (children.length === 1) {
      el = children[0]
    } else if (children.length > 1) {
      // Multi-root template: wrap in a container
      el = document.createElement('div')
      el.style.display = 'contents'
      children.forEach(c => el.appendChild(c))
    } else {
      el = temp.firstElementChild || document.createElement('div')
    }

    // Swap placeholder cids with live elements
    el.querySelectorAll('[data-cid]').forEach(placeholder => {
      const cid = placeholder.getAttribute('data-cid')
      const liveEl = window.__el && window.__el[cid]
      if (liveEl && liveEl !== el) placeholder.replaceWith(liveEl)
    })

    return el
  }

  // ── Create root element ───────────────────────────────────
  let component
  _state = { ...initialState }
  component = buildRoot(_state)

  // ── Core prototype ────────────────────────────────────────
  const proto = {
    fn: fnProxy,
    uid,
    getState() { return { ..._state } },

    // ── Register methods on global bridge + controller ───────
    register(methodMap) {
      for (const [name, fn] of Object.entries(methodMap)) {
        window.__app[uid][name] = fn
        proto[name] = fn
      }
      return obj
    },

    // ── Access a tracked element ─────────────────────────────
    $(id) { return _els[id] },

    // ── Pub/sub messaging ────────────────────────────────────
    on(message, handler) {
      if (!_queue[message]) _queue[message] = []
      _queue[message].push(handler)
      return obj
    },
    off(message, handler) {
      if (_queue[message]) {
        _queue[message] = _queue[message].filter(h => h !== handler)
      }
      return obj
    },
    emit(message, ...payload) {
      const handlers = _queue[message]
      if (handlers?.length) handlers.forEach(h => h(...payload))
      return obj
    },
    // Legacy alias — use emit()
    /** @deprecated Use emit() instead */
    message(message, ...payload) { return obj.emit(message, ...payload) },

    // ── DOM event binding ────────────────────────────────────
    trigger(event, id, cbfn) {
      _triggers[id] = (_triggers[id] || []).concat([{ type: event, cb: cbfn }])
      if (_els[id]) {
        let bound = _boundTriggers[id]
        if (!bound) { bound = new Set(); _boundTriggers[id] = bound }
        if (!bound.has(cbfn)) {
          _els[id].addEventListener(event, cbfn)
          bound.add(cbfn)
        }
      }
      return obj
    },

    // ── Deferred execution ───────────────────────────────────
    defer(action, delay = 0) {
      const id = setTimeout(() => {
        action()
        _timeouts = _timeouts.filter(t => t !== id)
      }, delay)
      _timeouts.push(id)
      return obj
    },

    // ── Destroy: full cleanup ────────────────────────────────
    destroy() {
      _timeouts.forEach(clearTimeout)
      _timeouts = []
      _unsubs.forEach(fn => { try { fn() } catch (e) { console.error('Unsub error:', e) } })
      _unsubs = []

      unbindAllTriggers()

      delete window.__app[uid]
      delete window.__el[uid]
      _queue = {}; _triggers = {}; _boundTriggers = {}
      _state = {}; _els = {}; _store = {}
      component = null
      return obj
    },

    unsub(fn) { if (typeof fn === 'function') _unsubs.push(fn); return obj },
    /**
     * Remove a tracked element. Unbinds its event listeners, removes it
     * from the DOM, and deletes it from the element registry.
     */
    delete(id) {
      const el = _els[id]
      if (!el) return obj

      // Unbind all triggers for this element
      if (_triggers[id]) {
        _triggers[id].forEach(t => {
          if (_boundTriggers[id] && _boundTriggers[id].has(t.cb)) {
            el.removeEventListener(t.type, t.cb)
            _boundTriggers[id].delete(t.cb)
          }
        })
        delete _triggers[id]
        delete _boundTriggers[id]
      }

      // Remove from DOM
      el.remove()

      // Remove from element registry
      delete _els[id]
      return obj
    },

    // ── Morph a single element ───────────────────────────────
    morph(id, htmlString) {
      const el = _els[id]
      if (el) {
        const temp = document.createElement('div')
        temp.innerHTML = htmlString.trim()
        const newEl = temp.firstElementChild || temp
        morphdom(el, newEl, morphOpts)
      }
      return obj
    },

    /**
     * render(patch) — the single update entry point.
     *
     * Merges `patch` into application state then morphs the DOM.
     * Guards against calls after destroy (component is null).
     */
    render(patch = {}) {
      if (!component) return obj
      _state = { ..._state, ...patch }
      const newRoot = buildRoot(_state)

      if (newRoot) {
        _els = {}
        _boundTriggers = {}

        morphdom(component, newRoot, morphOpts)

        autoOnboard(component)
        rebindTriggers()
      }

      return obj
    },

    // ── Cache helpers ────────────────────────────────────────
    setCache(key, data) { _store[key] = data; return obj },
    getCache(key) { return _store[key] },
    deleteCache(key) { delete _store[key]; return obj },

    // ── Element access ───────────────────────────────────────
    element() { return component },

    toString() {
      window.__el[uid] = component
      return `<span data-cid="${uid}"></span>`
    },
    valueOf() { return component },
  }

  // ── Proxy: ctrl['my-id'] → element, ctrl.method → proto ──
  // Must be created BEFORE auto-register (register() returns obj)
  const obj = new Proxy(proto, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && Object.prototype.hasOwnProperty.call(_els, prop)) {
        return _els[prop]
      }
      return Reflect.get(target, prop, receiver)
    },
    set(target, prop, value, receiver) {
      return Reflect.set(target, prop, value, receiver)
    },
    has(target, prop) {
      if (typeof prop === 'string' && Object.prototype.hasOwnProperty.call(_els, prop)) return true
      return Reflect.has(target, prop)
    },
    ownKeys(target) {
      return [...new Set([...Reflect.ownKeys(target), ...Object.keys(_els)])]
    },
    getOwnPropertyDescriptor(target, prop) {
      if (typeof prop === 'string' && Object.prototype.hasOwnProperty.call(_els, prop)) {
        return { enumerable: true, configurable: true, value: _els[prop] }
      }
      return Reflect.getOwnPropertyDescriptor(target, prop)
    }
  })

  // ── Auto-onboard ──────────────────────────────────────────
  if (component) autoOnboard(component)

  // Explicit Resource Management (TC39 Stage 3)
  if (typeof Symbol !== 'undefined' && Symbol.dispose) {
    proto[Symbol.dispose] = function () { this.destroy() }
  }

  // ── Auto-register methods ──────────────────────────────────
  if (methods) obj.register(methods)

  // ── Patch controller methods onto the DOM element ───────────
  if (component) Object.assign(component, proto)

  return obj
}
