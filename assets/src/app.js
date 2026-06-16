/**
 * app.js — Shell bootstrap with child controller composition.
 *
 * Architecture: Single shell controller owns only chrome state
 * (route, user, sidebar). Every view is a controller factory.
 * On route change: old view controller is destroyed, new one created,
 * embedded in shell via toString() → data-cid swap.
 *
 * Chrome pieces (sidebar, topbar, mobile nav, toasts) are rendered
 * inline from shell-template.js — they read shell state for highlight
 * and user display. Toast container is a static placeholder.
 */

import { controller, html, esc } from './controller.js'
import { createRouter } from './router.js'
import { shellTemplate } from './shell-template.js'
import { INITIAL_STATE, PUBLIC_ROUTES, PUBLIC_PREFIX, DEFAULT_ROUTE, LOGIN_ROUTE } from './constants/app.js'
import { PAGE_TITLES } from './constants/nav.js'
import { EventBus, MSG } from './messages/catalog.js'

// ── View controller factories (Phase 8) ────────────────────────────
import { createLoginView } from './views/login.js'
import { createDashboard } from './views/dashboard.js'
import { createCalendarConnections } from './views/calendar-connections.js'
import { createEventTypes } from './views/event-types.js'
import { createBookingPageEditor } from './views/booking-page-editor.js'
import { createAvailability } from './views/availability.js'
import { createBooking } from './views/booking.js'
import { createRoutingForms } from './views/routing-forms.js'
import { createPools } from './views/pools.js'
import { createWorkspaces } from './views/workspaces.js'
import { createWorkspaceDetail } from './views/workspace-detail.js'
import { createTimeTracking } from './views/time-tracking.js'
import { createComplianceView } from './views/compliance.js'
import { createWebhooks } from './views/webhooks.js'
import { createApiKeys } from './views/api-keys.js'
import { createSettings } from './views/settings.js'
import { createContacts } from './views/contacts.js'
import { createContactDetail } from './views/contact-detail.js'
import { createResources } from './views/resources.js'
import { createAuditLog } from './views/audit-log.js'

// ── Firebase helpers ──────────────────────────────────────────────
const fb = window._firebase
let _auth = null

// ── Current user (used by route guard + shell) ────────────────────

let _currentUser = null

function getCurrentUser() {
  return _currentUser
}

function userFromFirebase(firebaseUser) {
  if (!firebaseUser) return null
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || '',
    photoURL: firebaseUser.photoURL || '',
  }
}

// ── Route helpers ─────────────────────────────────────────────────

function resolvePageTitle(path) {
  if (PAGE_TITLES[path]) return PAGE_TITLES[path]
  if (path.startsWith('/book/')) return 'Book a Meeting'
  if (path.startsWith('/workspaces/')) return 'Workspace'
  if (path.startsWith('/contacts/')) return 'Contact'
  return 'Calendly'
}

function isPublicRoute(path) {
  if (PUBLIC_ROUTES.includes(path)) return true
  if (path.startsWith(PUBLIC_PREFIX)) return true
  return false
}

// ── Current view controller ───────────────────────────────────────

let _currentView = null

function mountView(path, params, query) {
  // Destroy previous view controller
  destroyCurrentView()

  // Try exact match first
  let factory = _viewFactories[path]

  // Fallback: match parameterised routes by matching path against patterns
  if (!factory) {
    for (const [pattern, fac] of Object.entries(_viewFactories)) {
      if (!pattern.includes(':')) continue
      // Simple test: extract constant prefix from pattern and check if path starts with it
      const prefix = pattern.split(':')[0]
      if (path.startsWith(prefix)) {
        const resolved = router.match(path)
        if (resolved) {
          factory = fac
          break
        }
      }
    }
  }

  if (!factory) {
    _currentView = null
    return null
  }

  _currentView = factory({ router, eventBus: EventBus })

  // Bridge: merge shell chrome state into view
  const shellState = shell.getState()
  _currentView.render({
    user: shellState.user,
    currentParams: params,
    currentQuery: query,
  })

  // Auto-load view data if the view has a load() method
  if (typeof _currentView.load === 'function') {
    _currentView.load().catch(e => {
      console.error('[shell] view load error:', e)
    })
  }

  // Bridge: register shell methods on the view controller so that
  // onclick="${fn.navigateTo}(...)" and similar resolve correctly.
  // The view controller's fnProxy resolves against window.__app[viewUid],
  // so we register these methods on the view controller itself.
  _currentView.register({
    navigateTo(route) { router.go(route) },
    retryRoute() { router.go(path) },
    toggleSidebar() { shell.render({ sidebarOpen: !shell.getState().sidebarOpen }) },
    async signOut() {
      const { signOut } = await import('./services/auth.service.js')
      await signOut().unwrap()
    },
    signIn() {
      import('./services/auth.service.js').then(({ signInWithGoogle }) => {
        signInWithGoogle().unwrap().catch(e => {
          console.error('[auth] sign-in error:', e)
        })
      })
    },
  })

  return _currentView
}

function destroyCurrentView() {
  if (_currentView) {
    try { _currentView.destroy() } catch (e) { console.error('[shell] view destroy error:', e) }
    _currentView = null
  }
}

// ── Router ────────────────────────────────────────────────────────

// View factory map: pattern → createXView factory
const _viewFactories = {
  '/':                           createDashboard,
  '/login':                      createLoginView,
  '/calendar':                   createCalendarConnections,
  '/event-types':                createEventTypes,
  '/event-types/editor':         createBookingPageEditor,
  '/availability':               createAvailability,
  '/book/:hostId/:eventTypeId':  createBooking,
  '/book/otl/:token':            createBooking,
  '/routing-forms':              createRoutingForms,
  '/pools':                      createPools,
  '/workspaces':                 createWorkspaces,
  '/workspaces/:id':             createWorkspaceDetail,
  '/resources':                  createResources,
  '/contacts':                   createContacts,
  '/contacts/:id':               createContactDetail,
  '/time-tracking':              createTimeTracking,
  '/audit-log':                  createAuditLog,
  '/compliance':                 createComplianceView,
  '/webhooks':                   createWebhooks,
  '/api-keys':                   createApiKeys,
  '/settings':                   createSettings,
}

const router = createRouter({
  routes: {
    '/':                           () => html`<span id="route-dashboard"></span>`,
    '/login':                      () => html`<span id="route-login"></span>`,
    '/calendar':                   () => html`<span id="route-calendar"></span>`,
    '/event-types':                () => html`<span id="route-eventtypes"></span>`,
    '/event-types/editor':         () => html`<span id="route-editor"></span>`,
    '/availability':               () => html`<span id="route-availability"></span>`,
    '/book/:hostId/:eventTypeId':  () => html`<span id="route-book"></span>`,
    '/book/otl/:token':            () => html`<span id="route-book-otl"></span>`,
    '/routing-forms':              () => html`<span id="route-routingforms"></span>`,
    '/pools':                      () => html`<span id="route-pools"></span>`,
    '/workspaces':                 () => html`<span id="route-workspaces"></span>`,
    '/workspaces/:id':             () => html`<span id="route-workspace"></span>`,
    '/resources':                  () => html`<span id="route-resources"></span>`,
    '/contacts':                   () => html`<span id="route-contacts"></span>`,
    '/contacts/:id':               () => html`<span id="route-contact"></span>`,
    '/time-tracking':              () => html`<span id="route-timetracking"></span>`,
    '/audit-log':                  () => html`<span id="route-auditlog"></span>`,
    '/compliance':                 () => html`<span id="route-compliance"></span>`,
    '/webhooks':                   () => html`<span id="route-webhooks"></span>`,
    '/api-keys':                   () => html`<span id="route-apikeys"></span>`,
    '/settings':                   () => html`<span id="route-settings"></span>`,
  },
  initial: DEFAULT_ROUTE,
  useHash: true,
})

// ── Route Guard ───────────────────────────────────────────────────

router.guard('*', ({ to }) => {
  const user = getCurrentUser()
  const isPublic = isPublicRoute(to)
  if (!user && !isPublic) {
    router.go(LOGIN_ROUTE, { replace: true })
    return false
  }
  return true
})

// ── Shell Template ────────────────────────────────────────────────
//
// The shell template renders chrome (sidebar, topbar, mobile nav)
// plus the current view controller. The view controller is embedded
// via toString() → data-cid placeholder, which buildRoot() + morphdom
// swaps with the live controller element.

function template({ state, fn }) {
  const isPublic = state.isPublicRoute
  const viewCtrl = state._viewCtrl

  // Build content HTML: either the live view controller or a loading/empty state
  let contentHtml = ''
  if (viewCtrl) {
    contentHtml = viewCtrl.toString()
  } else if (state.loading) {
    contentHtml = html`<div style="text-align:center;padding:64px;color:#8A8993;">Loading...</div>`
  } else {
    contentHtml = html`<div class="empty-state"><div class="empty-state-title">404</div><div class="empty-state-desc">Page not found</div></div>`
  }

  const shellState = { ...state, contentHtml }
  return shellTemplate({ state: shellState, fn })
}

// ── Create Shell Controller ───────────────────────────────────────

const shell = controller({
  template,
  state: { ...INITIAL_STATE },
  methods: {},
})

// ── Public API methods ────────────────────────────────────────────

shell.register({
  navigateTo(route) {
    router.go(route)
  },
  toggleSidebar() {
    shell.render({ sidebarOpen: !shell.getState().sidebarOpen })
  },
  async signOut() {
    const { signOut } = await import('./services/auth.service.js')
    await signOut().unwrap()
  },
})

// ── Router change handler ─────────────────────────────────────────

router.onChange(async ({ path, params, query }) => {
  // Close mobile sidebar on navigation
  shell.render({ sidebarOpen: false })

  // Advance EventBus generation — invalidates stale callbacks
  EventBus.nextGen()

  // Mount the new view (destroys previous view controller)
  const viewCtrl = mountView(path, params, query)

  // Emit route-changing (views can react before render)
  EventBus.emit(MSG.ROUTE_CHANGING, { path, params, query })

  // Render shell with new view controller
  const public_ = isPublicRoute(path)
  shell.render({
    route: path,
    currentParams: params,
    currentQuery: query,
    isPublicRoute: public_,
    pageTitle: resolvePageTitle(path),
    loading: false,
    error: null,
    _viewCtrl: viewCtrl,
  })

  // Emit route-changed post-render
  EventBus.emit(MSG.ROUTE_CHANGED, { path, params, query })
})

// ── Auth Listener ─────────────────────────────────────────────────

function initAuth(authInstance) {
  _auth = authInstance

  fb.onAuthStateChanged(_auth, (firebaseUser) => {
    _currentUser = firebaseUser
    const user = userFromFirebase(firebaseUser)

    if (firebaseUser) {
      shell.render({ user, authLoading: false, authError: null })
      if (_currentView) {
        _currentView.render({ user })
        if (typeof _currentView.load === 'function') _currentView.load()
      }
      EventBus.emit(MSG.AUTH_CHANGED, { user })

      if (router.current === LOGIN_ROUTE) {
        router.go(DEFAULT_ROUTE, { replace: true })
      }
    } else {
      shell.render({ user: null, authLoading: false, authError: null })
      if (_currentView) {
        _currentView.render({ user: null })
        if (typeof _currentView.load === 'function') _currentView.load()
      }
      EventBus.emit(MSG.AUTH_CHANGED, { user: null })

      if (!isPublicRoute(router.current)) {
        router.go(LOGIN_ROUTE, { replace: true })
      }
    }
  })
}

// ── Mount to DOM ──────────────────────────────────────────────────

const mountEl = document.getElementById('app')
if (mountEl) {
  mountEl.replaceWith(shell.element())
}

// ── Auto-wire auth (triggers initial route via onChange) ─────────

Promise.resolve().then(async () => {
  const { auth } = await import('./firebase.js')
  initAuth(auth)
})

// ── Cleanup on unload ─────────────────────────────────────────────

window.addEventListener('beforeunload', () => {
  destroyCurrentView()
  try { shell.destroy() } catch (_) { /* ignore */ }
})

// ── Exports ───────────────────────────────────────────────────────

export { shell as app, router, getCurrentUser }
export default shell
