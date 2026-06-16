/**
 * Router — a thin state machine that lives inside the controller pattern.
 *
 * Routes are just state. Navigation is just ctrl.render({ route: '/path' }).
 * The hash fragment syncs for browser back/forward support.
 *
 * Usage:
 *   const router = createRouter({
 *     routes: {
 *       '/search':   () => searchTemplate,
 *       '/manual':   () => manualTemplate,
 *       '/settings': () => settingsTemplate,
 *       '/settings/instances/:id': () => instanceDetailTemplate,
 *     },
 *     initial: '/search',
 *     useHash: true,
 *   })
 *
 *   // Critical: wire router to controller
 *   router.onChange(({ path }) => ctrl.render({ route: path }))
 *
 *   // Template:
 *   function template({ state, fn }) {
 *     const view = router.match(state.route)
 *     return html`<div id="app">${view ? view() : '404'}</div>`
 *   }
 */

export function createRouter({ routes, initial = '/', useHash = true }) {
  let _current = initial
  let _params = {}
  let _query  = {}
  const _guards = new Map()  // pattern → guard fn
  let _onChange = null

  // ── Pattern parser: '/users/:id/posts/:postId' → regex + keys ──
  function _parse(pattern) {
    const keys = []
    const regexStr = pattern
      .replace(/\//g, '\\/')
      .replace(/:(\w+)/g, (_, key) => { keys.push(key); return '([^/]+)' })
      .replace(/\*/g, '.*')
    return { regex: new RegExp(`^${regexStr}$`), keys }
  }

  // Compile route patterns once
  const _compiled = Object.entries(routes).map(([pattern, fn]) => ({
    ..._parse(pattern),
    pattern,
    fn,
  }))

  // ── Resolve a raw path → { pattern, fn, params, query } or null ──
  function _resolve(raw) {
    const [pathPart, qs] = raw.split('?', 2)

    // Parse query string
    const query = {}
    if (qs) {
      qs.split('&').forEach(pair => {
        const [k, v] = pair.split('=', 2)
        query[decodeURIComponent(k)] = v !== undefined ? decodeURIComponent(v) : true
      })
    }

    // Match against compiled patterns
    for (const item of _compiled) {
      const m = pathPart.match(item.regex)
      if (m) {
        const params = {}
        item.keys.forEach((k, i) => params[k] = decodeURIComponent(m[i + 1]))
        return { ...item, params, query }
      }
    }

    return null
  }

  // ── Public match — returns the template function for the given path ──
  function match(path) {
    const resolved = _resolve(path)
    if (resolved) {
      _params = resolved.params
      _query  = resolved.query
      return resolved.fn
    }
    return null
  }

  // ── Navigate ──────────────────────────────────────────────────────
  function go(path, { replace = false } = {}) {
    const resolved = _resolve(path)

    // Check specific-pattern guard first, then wildcard * guard as fallback
    if (resolved) {
      const patternGuard = _guards.get(resolved.pattern)
      if (patternGuard && !patternGuard({ from: _current, to: path, params: resolved.params })) {
        return false
      }
    }
    const wildcardGuard = _guards.get('*')
    if (wildcardGuard && !wildcardGuard({ from: _current, to: path, params: resolved ? resolved.params : {} })) {
      return false
    }

    // Update _current AFTER guard check so it stays correct on rejection
    _current = path
    if (useHash) {
      if (replace) {
        window.history.replaceState(null, '', `#${path}`)
      } else {
        window.location.hash = path
      }
    }

    _notify(resolved)
    return true
  }

  function back()    { window.history.back() }
  function forward() { window.history.forward() }

  // ── Guard registration (pattern-based) ───────────────────────────
  function guard(pattern, fn) {
    _guards.set(pattern, fn)
  }

  // ── Change listener ──────────────────────────────────────────────
  function onChange(fn) { _onChange = fn }

  // ── Internal: sync params + query, fire callback ─────────────────
  function _notify(resolved) {
    resolved = resolved || _resolve(_current)
    if (resolved) {
      _params = resolved.params
      _query  = resolved.query
    }
    if (_onChange) _onChange({ path: _current, params: _params, query: _query })
  }

  // ── Hash listener ────────────────────────────────────────────────
  if (useHash) {
    // Read initial hash for deep links
    _current = window.location.hash.slice(1) || initial

    // Defer first notify so caller has time to register onChange
    setTimeout(() => _notify(), 0)

    window.addEventListener('hashchange', () => {
      _current = window.location.hash.slice(1) || initial
      _notify()
    })
  }

  return {
    get current() { return _current },
    get params()  { return _params },
    get query()   { return _query },
    match,
    go,
    back,
    forward,
    guard,
    onChange,
    href(path)    { return `#${path}` },
  }
}
