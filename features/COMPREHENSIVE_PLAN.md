# Calendly v2 — Comprehensive Implementation Plan v2

## Context
Building an internal enterprise scheduling & lifecycle management platform. Pure JS + Firebase RTDB + controller/router pattern + Tailwind. The PRD defines 5 epics. No payment/revenue features — this is an internal tool for team scheduling, not a commercial product. Three adversarial review agents found 10 blockers and 18 majors in the initial plan. This v2 plan resolves all of them.

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│  index.html (shell + CDNs + CSP + font loading)               │
├──────────────────────────────────────────────────────────────┤
│  app.js (controller + router + auth + route loaders)          │
├─────────────┬──────────────┬───────────────┬─────────────────┤
│  Views/     │  Services/   │  Utils/       │  Firebase RTDB    │
│  16 files   │  9 files     │  4 files      │  (realtime sync)  │
│  template   │  AsyncResult │  Result.js    │  + Functions/     │
│  functions  │  returns     │  datetime.js  │  3 Cloud Funcs    │
│             │              │  crypto.js    │                   │
│             │              │  validators.js│                   │
└─────────────┴──────────────┴───────────────┴──────────────────┘
```

**Pattern**: Modular Frontend Monolith + Service Layer + Thin Cloud Functions Backend.

**Why**: controller.js handles state+template+morphdom. Full MVC is over-architected. Services isolate Firebase I/O. Cloud Functions handle server-side-only concerns (webhooks, email, timer enforcement).

**Build**: Vite (zero-config) bundles `assets/src/` → `assets/dist/bundle.js`. Source remains in `assets/src/`; only the bundle is loaded in production. Eliminates 56+ sequential HTTP requests.

**EventBus**: All cross-component messages route through a centralized `EventBus` (in `messages/`). Named channels, logged dispatch, validated cleanup. Prevents spaghetti event mesh across 16 views.

### 1.1 Component Architecture

Following the Advanced Search v2 pattern, the app is composed of **reusable shared components** + **page-level views** that compose them. Every component follows this pattern:

```js
import { controller, html, esc } from '../controller.js'

export function MyComponent() {
  function template({ state, fn }) {
    return html`<div class="my-component">${esc(state.title)}</div>`
  }
  const ctrl = controller({
    template,
    state: { title: '' },
    methods: {
      handleAction() { ctrl.render({ title: 'updated' }) }
    }
  })
  // Post-creation method attachments
  ctrl.setTitle = (title) => ctrl.render({ title })
  return ctrl  // ctrl IS also a DOM element reference (via Proxy)
}
```

**Key patterns:**
- Components export a factory function → returns `ctrl` (controller instance that is also a DOM element)
- Pure presentational functions export an `html` template directly (no state, no methods)
- Cross-component communication: `ctrl.message(MSG.EVENT, data)` / `ctrl.on(MSG.EVENT, handler)`
- State updates ONLY via `ctrl.render(partialState)` — never mutate state directly
- `onclick` handlers: `onclick="${fn.methodName}()"` or `onclick="${fn.methodName}(event)"`
- **Child composition**: Parents place `<div data-cid="child-name">` placeholders in their template. Children self-mount into these placeholders after parent renders. Parents MUST NOT own child DOM — morphdom would shred child controller state and event listeners on re-render.
- Post-creation API: attach methods to ctrl after `controller()` call (e.g., `ctrl.open = () => ...`)

**Child composition with `data-cid` placeholders:**

```js
// Parent template — renders a placeholder, NOT the child:
function parentTemplate({ state, fn }) {
  return html`<div class="parent">
    <h2>Parent Content</h2>
    <div data-cid="my-modal"></div>   <!-- child mounts here -->
  </div>`
}

// In app bootstrap or after parent render:
const parent = ParentComponent()
parent.render({ title: 'My View' })
// Child self-mounts into parent's placeholder after parent DOM exists:
const modal = Modal()
modal.mount(parent.el.querySelector('[data-cid="my-modal"]'))
modal.configure({ title: 'Settings', bodyHtml: '...' })
```

### 1.2 Directory Structure

```
Calendly v2/
├── index.html                          # Shell: CDNs, CSP, root mount
├── .env.example                        # Required env vars
├── firebase.json                       # Firebase project config
├── database.rules.json                 # RTDB security rules
│
├── assets/
│   └── src/
│       ├── controller.js               # [EXISTING] Controller factory + html + esc
│       ├── router.js                   # [EXISTING] Hash router
│       ├── app.js                      # Bootstrap: create all components, wire router
│       ├── firebase.js                 # Firebase init + wrapped helpers
│       │
│       ├── messages/
│       │   └── catalog.js              # Message constants (MSG.AUTH_CHANGED, etc.)
│       │
│       ├── utils/
│       │   ├── Result.js               # Result + AsyncResult fluent classes
│       │   ├── datetime.js             # Slot generation, DST-safe date math
│       │   ├── crypto.js               # Web Crypto API wrappers
│       │   ├── validators.js           # Pure validation functions
│       │   └── icons.js                # SVG icon templates (search, check, x, chevron, etc.)
│       │
│       ├── services/
│       │   ├── auth.service.js         # Google OAuth, user profiles
│       │   ├── calendar.service.js     # OAuth calendar connect, sync, push-back
│       │   ├── event-type.service.js   # Event type CRUD
│       │   ├── booking.service.js      # Atomic slot booking
│       │   ├── availability.service.js # Slots, working hours, booking rules
│       │   ├── routing.service.js      # Routing forms, round-robin, pools
│       │   ├── workspace.service.js    # Workspace, tasks, timer, time tracking
│       │   ├── notification.service.js # Email/SMS dispatch to Cloud Functions
│       │   └── webhook.service.js      # Webhook subscription management
│       │
│       ├── components/                 # SHARED reusable components
│       │   ├── badge.js                # Status badge (success/warning/danger/info)
│       │   ├── spinner.js              # Loading spinner
│       │   ├── skeleton-card.js        # Loading skeleton placeholder
│       │   ├── skeleton-table.js       # Loading table skeleton
│       │   ├── empty-state.js          # Empty state with icon + message + action
│       │   ├── modal.js                # Modal dialog (title, body, footer, onClose)
│       │   ├── toast.js                # Toast notifications (success/error/warning)
│       │   ├── confirm-dialog.js       # Confirmation modal ("Are you sure?")
│       │   ├── data-table.js           # Sortable table with columns config
│       │   ├── pagination.js           # Page navigation (prev, next, page numbers)
│       │   ├── tab-bar.js              # Tab navigation (list of tabs, active state)
│       │   ├── search-input.js         # Debounced search input with clear button
│       │   ├── status-dot.js           # Colored dot (green/yellow/red/gray)
│       │   ├── date-picker.js          # Date selection carousel/calendar
│       │   ├── time-slot-grid.js       # Time slot button grid
│       │   ├── form-field.js           # Dynamic form field renderer
│       │   ├── copy-button.js          # Copy-to-clipboard button with feedback
│       │   └── user-avatar.js          # User avatar circle with initials
│       │
│       └── views/                      # PAGE-LEVEL views composing components
│           ├── login.js                # Route: /login
│           ├── dashboard.js            # Route: /
│           ├── calendar-connections.js # Route: /calendar
│           ├── event-types.js          # Route: /event-types
│           ├── booking-page-editor.js  # Route: /event-types/editor
│           ├── availability.js         # Route: /availability
│           ├── booking.js              # Route: /book/:hostId/:eventTypeId
│           ├── routing-forms.js        # Route: /routing-forms
│           ├── pools.js                # Route: /pools
│           ├── workspaces.js           # Route: /workspaces
│           ├── workspace-detail.js     # Route: /workspaces/:id
│           ├── time-tracking.js        # Route: /time-tracking
│           ├── compliance.js           # Route: /compliance
│           ├── webhooks.js             # Route: /webhooks
│           ├── api-keys.js             # Route: /api-keys
│           └── settings.js             # Route: /settings
│
├── functions/
│   ├── package.json                    # Firebase Functions deps
│   └── src/
│       ├── dispatch-webhook.js         # onValueWritten → webhook POSTs
│       ├── enforce-timer-limit.js      # onValueWritten → auto-stop after 8h
│       ├── send-notification.js        # HTTP trigger → email/SMS dispatch
│       └── oauth-token-exchange.js     # HTTP trigger → token exchange server-side
│
├── features/                           # [PLANNING] Design docs
│   ├── COMPREHENSIVE_PLAN.md           # This file
│   ├── phase-0-foundation.md           # [v1 — superseded]
│   ├── phase-1-utilities.md            # [v1 — superseded]
│   ├── phase-2-services.md             # [v1 — superseded]
│   ├── phase-3-views.md                # [v1 — superseded]
│   ├── phase-4-config.md               # [v1 — superseded]
│   └── tasks.json                      # [v1 — superseded]
│
└── Strategic Research Report_ ... .md  # PRD reference document
```

**File count**: 59 new files (6 foundation + 3 utilities + 18 components + 9 services + 16 views + 4 Cloud Functions + 3 config) + 2 existing = 61 total
**Directories to create**: `assets/src/utils/`, `assets/src/services/`, `assets/src/components/`, `assets/src/views/`, `assets/src/messages/`, `functions/src/`

---

## 2. Critical Controller Pattern Fixes (from Plan v1 Review)

### 2.1 XSS: HTML Escaping (Blocker #1)

The `html` tagged template in controller.js does zero escaping. Every user-controlled value injected as raw HTML is stored XSS.

**Fix**: Add `esc()` to controller.js and wrap user values:

```js
// controller.js — add:
export const esc = (str) => {
  if (str === null || str === undefined) return ''
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return String(str).replace(/[&<>"']/g, c => map[c])
}

// Every view template MUST use esc() on user-controlled values:
html`<h2>${esc(state.eventType.title)}</h2>`
html`<input value="${esc(state.formData.name)}">`
```

**Rule**: Any value originating from user input, RTDB, or URL params → wrap in `esc()`. Only static strings and trusted state keys skip it.

### 2.2 Onclick Handlers (Blocker #2)

`fnProxy` returns `__app['uid'].method` (reference, not invocation). Browser discards the evaluated reference.

**Fix**: All onclick attributes in templates must include `()`:

```js
// WRONG:
html`<button onclick="${fn.signIn}">Sign In</button>`

// RIGHT:
html`<button onclick="${fn.signIn}()">Sign In</button>`
html`<button onclick="${fn.deleteEventType}('${esc(eventId)}')">Delete</button>`
```

### 2.3 Route Factory Wrappers (Blocker #3)

`router.match('/')` returns `() => dashboardView` (the factory). Calling `viewFn({state, fn})` invokes the factory, ignores args, returns the raw function — not HTML.

**Fix**: Routes map directly to view functions, no `() =>` wrappers:

```js
const router = createRouter({
  routes: {
    '/':                     dashboardView,
    '/login':                loginView,
    '/calendar':             calendarConnectionsView,
    '/event-types':          eventTypesView,
    '/event-types/editor':   bookingPageEditorView,
    '/availability':         availabilityView,
    '/book/:hostId/:eventTypeId': bookingView,
    '/routing-forms':        routingFormsView,
    '/pools':                poolsView,
    '/workspaces':           workspacesView,
    '/workspaces/:id':       workspaceDetailView,
    '/time-tracking':        timeTrackingView,
    '/compliance':           complianceView,
    '/webhooks':             webhooksView,
    '/api-keys':             apiKeysView,
    '/settings':             settingsView,
  },
  initial: '/',
  useHash: true,
})
```

---

## 3. Design System (Reconciled)

### 3.1 Color Palette (from calendly-design SKILL.md)

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Accent | `#004eba` | `text-[#004eba]` / `bg-[#004eba]` | CTAs, links, focus rings, active states |
| Accent hover | `#003d9e` | `hover:bg-[#003d9e]` | Button hover |
| Background | `#ffffff` | `bg-white` | Page background |
| Surface | `#f0f3f8` | `bg-[#f0f3f8]` | Cards, panels, modals |
| Text primary | `#0a0a0a` | `text-[#0a0a0a]` | Headings, body text |
| Text muted | `#0b3558` | `text-[#0b3558]` | Captions, placeholders, secondary |
| Border | `#272727` | `border-[#272727]` | Card borders, dividers, input borders |
| Success | `#10b981` | `bg-emerald-500` | Confirmed status, success toasts |
| Warning | `#f59e0b` | `bg-amber-500` | Pending status, warnings |
| Danger | `#dc2626` | `bg-red-600` | Error, cancelled, delete actions |
| Info | `#006bff` | `text-[#006bff]` | Informational highlights |

### 3.2 Typography

| Role | Font | Weight | Size | Line Height |
|------|------|--------|------|-------------|
| Heading 1 | Geist | 700 | 5rem (80px) | 1.2 |
| Heading 2 | Geist | 700 | 3.125rem (50px) | 1.2 |
| Heading 3 | Geist | 700 | 2rem (32px) | 1.2 |
| Body | gilroy | 400 | 1.125rem (18px) | 1.5 |
| Caption | gilroy | 400 | 1rem (16px) | 1.5 |
| Small / label | gilroy | 400 | 0.875rem (14px) | 1.5 |
| Code | SFMono-Regular | 400 | 14px | — |

**Rules**: Max 3-4 font sizes per screen. Headings weight 600-700, body weight 400. Use color/opacity for hierarchy, not additional sizes.

### 3.3 Spacing & Layout

- **Grid base**: 4px
- **Scale**: 4, 8, 12, 16, 20, 24, 32, 48px (Tailwind: p-1 through p-12)
- **Tight** (4-8px): related items (icon + label)
- **Medium** (12-16px): between groups within section
- **Wide** (24-32px): between sections
- **Container max-width**: 992px, centered with `mx-auto`
- **Section padding**: px-4 (16px) mobile, px-6 (24px) desktop

### 3.4 Border Radius

**Default**: 10px (`rounded-[10px]`) for cards, buttons, inputs, modals.
Scale available: 4, 6, 8, 10, 12, 16, 20, 24, 32px.

### 3.5 Shadows

| Level | Value | Usage |
|-------|-------|-------|
| None | none | Flat cards, buttons |
| Subtle | `shadow-sm` | Raised cards, input focus |
| Floating | `0px 4px 5px 0px #4767880A, 0px 4px 10px 0px #47678808, 0px 10px 20px 0px #4767880D` | Dropdowns, modals |
| Overlay | `0px 4px 5px 0px #4767880A, 0px 8px 15px 0px #47678808, 0px 30px 50px 0px #47678814` | Full-screen dialogs |

### 3.6 Animation

- **Micro-interactions**: 150ms ease-in-out
- **Page transitions**: 300ms ease-in-out
- **Stagger children**: 50ms delay
- **Respect**: `prefers-reduced-motion`

---

## 4. State Management & Data Flow

### 4.1 Complete Initial State

```js
const initialState = {
  // Router
  route: '/',
  currentParams: {},
  currentQuery: {},

  // Auth
  user: null,
  authLoading: true,
  authError: null,

  // Global UI
  firebaseConnected: true,
  toast: null,             // { type: 'success'|'error'|'warning', message }

  // Lazy-loaded per route (null = not loaded yet)
  dashboard: null,         // { bookingsToday, pendingCount, revenue, activeWorkspaces }
  eventTypes: null,        // EventType[]
  calendarConnections: null, // Connection[]
  slots: null,             // { [date]: Slot[] }
  routingForms: null,      // RoutingForm[]
  pools: null,             // Pool[]
  workspace: null,         // Workspace
  timeTracking: null,        // { timeEntries, summary }
  webhooks: null,          // WebhookSubscription[]
  apiKeys: null,           // ApiKey[]
}
```

### 4.2 Route Loaders (async data fetching lifecycle)

Routes need data before rendering. Controller has no async hook. Solution: a `routeLoaders` map keyed by route pattern, called before render.

```js
// app.js
const routeLoaders = {
  '/':                  () => dashboardService.getDashboardData(user.uid),
  '/calendar':          () => calendarService.listConnections(user.uid),
  '/event-types':       () => eventTypeService.listEventTypes(user.uid),
  '/event-types/editor':(params) => eventTypeService.getEventType(params.eventTypeId),
  '/availability':      () => availabilityService.getWorkingHours(user.uid),
  '/routing-forms':     () => routingService.listRoutingForms(user.uid),
  '/pools':             () => routingService.listPools(user.uid),
  '/workspaces':        () => workspaceService.listWorkspaces(user.uid),
  '/workspaces/:id':    (params) => workspaceService.getWorkspace(params.id),
  '/time-tracking':     () => workspaceService.getTimeTracking(user.uid),
  '/webhooks':          () => webhookService.listSubscriptions(user.uid),
  '/api-keys':          () => apiKeyService.listKeys(user.uid),
  '/settings':          () => authService.getUserProfile(user.uid),
}

router.onChange(async ({ path, params, query }) => {
  app.render({ route: path, currentParams: params, currentQuery: query, loading: true })

  const loader = routeLoaders[path]
  if (loader) {
    const [data, err] = await loader().unwrap()
    if (err) {
      app.render({ loading: false, error: err.message })
    } else {
      app.render({ ...data, loading: false, error: null })
    }
  }
})

// Views check state:
function dashboardView({ state, fn }) {
  if (!state.user) return loginView({ state, fn })
  if (state.loading) return loadingSkeleton()
  if (state.error) return errorBanner(state.error)
  // ... render with state.dashboard
}
```

### 4.3 Real-Time Subscriptions with Cleanup

Views that need live data register subscriptions. The route loader system tracks and cleans up:

```js
let activeSubscriptions = []

function beforeRouteChange() {
  activeSubscriptions.forEach(unsub => {
    try { unsub() } catch (e) { console.error('Unsub error:', e) }
  })
  activeSubscriptions = []
}

function registerSubscription(unsub) {
  activeSubscriptions.push(unsub)
}

// Usage in loader or view initialization:
beforeRouteChange()
const unsub = onValueSubscription(`/availability/${uid}/${date}`, (snap) => {
  app.render({ slots: snap.val() })
})
registerSubscription(unsub)
```

---

## 5. File Plan (59 new files)

### Tier 0: Foundation (6 files)

| # | File | Lines (max) | Purpose |
|---|------|-------------|---------|
| 1 | `index.html` | — | Shell: CSP meta, Tailwind CDN, Firebase SDKs v10, morphdom CDN, font loading (Geist + gilroy), import map, root `<div id="app">` |
| 2 | `assets/src/firebase.js` | ~80 | Firebase init, auth, rtdb. Exports: `auth`, `rtdb`, `dbRef`, `dbRead`, `dbWrite`, `dbUpdate`, `dbRemove`, `dbTransaction`, `onValueSubscription`, `withTimeout` |
| 3 | `assets/src/app.js` | ~120 | Bootstrap: create all component instances, wire router, route loaders, auth listener, subscription cleanup, mount shell to DOM |
| 4 | `assets/src/messages/catalog.js` | ~30 | Message constants object: `MSG.AUTH_CHANGED`, `MSG.BOOKING_CREATED`, `MSG.SLOT_SELECTED`, etc. Used by all components for pub/sub. |
| 5 | `assets/src/utils/Result.js` | ~100 | `Result` (sync) + `AsyncResult` (async) fluent classes |
| 6 | `assets/src/utils/icons.js` | ~80 | SVG icon templates as `html` literals: `icon.search`, `icon.check`, `icon.x`, `icon.chevron`, `icon.edit`, `icon.trash`, `icon.calendar`, `icon.clock`, `icon.users`, `icon.link`, `icon.download`, `icon.settings`, `icon.shield`, `icon.webhook`, `icon.key`, `icon.google`, `icon.microsoft`, `icon.spinner`, `icon.alert`, `icon.eye`, `icon.eyeOff`, `icon.copy` |

### Tier 1: Utilities (3 files)

| # | File | Lines (max) | Purpose |
|---|------|-------------|---------|
| 7 | `assets/src/utils/datetime.js` | ~120 | `generateSlots`, `formatDate`, `formatTime`, `toISODate`, `addMinutes`, `getDatesInRange`, `isSlotOverlapping`, `groupSlotsByDate`, `getMonthGrid`, DST-safe slot generation (all internal math in UTC) |
| 8 | `assets/src/utils/crypto.js` | ~80 | `encryptAES256GCM(plaintext, key)`, `decryptAES256GCM(ciphertext, key)`, `hashSHA256(data)`, `generateRandomBytes(n)`, `generateApiKey()`, `hashApiKey(rawKey)` — uses Web Crypto API (`crypto.subtle`) |
| 9 | `assets/src/utils/validators.js` | ~100 | `validateEmail`, `validateUrl`, `validateRequired`, `validateMinLength`, `validateMaxLength`, `validateEventType`, `validateBookingForm`, `validateTimeFormat`, `validateWebhookUrl`. All return `{valid, errors: [{field, message}]}`. Max lengths: name=200, email=254, customField=500. |

### Tier 2: Shared Components (18 files)

All components follow the `export function ComponentName() { ... return ctrl }` factory pattern. Stateful components return a `ctrl` (controller instance). Pure presentational functions return `html` directly.

| # | File | Type | Purpose |
|---|------|------|---------|
| 10 | `components/badge.js` | Pure | `badge(status, label)` → colored status badge (success/warning/danger/info) |
| 11 | `components/status-dot.js` | Pure | `statusDot(color)` → small colored circle (green/yellow/red/gray) |
| 12 | `components/spinner.js` | Stateful | `Spinner()` → loading spinner. `ctrl.show()` / `ctrl.hide()`. Uses `stringComponent`. |
| 13 | `components/skeleton-card.js` | Pure | `skeletonCards(count)` → N card skeletons with pulse animation |
| 14 | `components/skeleton-table.js` | Pure | `skeletonTable(rows)` → table row skeletons with pulse animation |
| 15 | `components/empty-state.js` | Stateful | `EmptyState()` → icon + title + description + optional action button. `ctrl.configure({ icon, title, desc, actionLabel, onAction })`. `ctrl.show()` / `ctrl.hide()`. |
| 16 | `components/toast.js` | Stateful | `Toast()` → floating toast notifications. `ctrl.success(msg)`, `ctrl.error(msg)`, `ctrl.warning(msg)`. Auto-dismiss after 4s. Uses message-based trigger: `ctrl.message(MSG.SHOW_TOAST, { type, message })`. |
| 17 | `components/modal.js` | Stateful | `Modal()` → centered dialog. `ctrl.configure({ title, bodyHtml, footerHtml, onClose })`. `ctrl.open()` / `ctrl.close()`. Closes on backdrop click + Escape key. |
| 18 | `components/confirm-dialog.js` | Stateful | `ConfirmDialog()` → "Are you sure?" modal. `ctrl.confirm({ title, message, confirmLabel, onConfirm, onCancel })`. Returns promise. |
| 19 | `components/tab-bar.js` | Stateful | `TabBar({ tabs })` → horizontal tab navigation. `ctrl.getActiveTab()` returns current tab id. |
| 20 | `components/search-input.js` | Stateful | `SearchInput({ placeholder, debounceMs })` → debounced search field. Emits `MSG.SEARCH_CHANGED` with query. `ctrl.clear()` / `ctrl.getValue()`. |
| 21 | `components/pagination.js` | Stateful | `Pagination()` → page navigation. `ctrl.setTotalPages(n)`. Exposes `ctrl.goPage(p)`, `ctrl.nextPage()`, `ctrl.prevPage()`. |
| 22 | `components/data-table.js` | Stateful | `DataTable()` → sortable data table. `ctrl.setColumns(cols)`, `ctrl.setData(rows)`. Handles sort, row click. Emits `MSG.ROW_CLICKED`. |
| 23 | `components/date-picker.js` | Stateful | `DatePicker()` → date carousel/calendar. `ctrl.getSelectedDate()`. Shows next 14-30 days. Disabled dates grayed. Emits `MSG.DATE_SELECTED`. |
| 24 | `components/time-slot-grid.js` | Stateful | `TimeSlotGrid()` → grid of clickable time buttons. `ctrl.setSlots(slots)`, `ctrl.getSelectedSlot()`. Emits `MSG.SLOT_SELECTED`. Shows timezone. |
| 25 | `components/form-field.js` | Pure | `formField(field, value)` → renders any field type (text, textarea, select, checkbox, radio) with label + error. Delegates to `html` template. |
| 26 | `components/copy-button.js` | Stateful | `CopyButton({ text })` → button that copies text to clipboard, shows "Copied!" feedback for 2s. |
| 27 | `components/user-avatar.js` | Pure | `userAvatar(user, size)` → circle with initials (or photo if available). Sizes: sm=32px, md=40px, lg=64px. |

### Tier 3: Services (9 files)

Every function returns `AsyncResult`. Constants: `DEFAULT_TIMEOUT = 10000`, `MAX_RETRIES = 3`, `RETRY_BASE_MS = 1000`. Retry only for idempotent ops.

| # | File | Lines | Key Functions |
|---|------|-------|---------------|
| 28 | `services/auth.service.js` | ~80 | `signInWithGoogle()` with popup-blocker fallback to redirect, `signOut()`, `getCurrentUser()`, `createUserProfile(uid, data)`, `getUserProfile(uid)`, `onAuthChange(cb)` → returns unsub |
| 29 | `services/calendar.service.js` | ~120 | `connectCalendar(uid, provider)` with CSRF state param, `handleOAuthCallback()`, `disconnectCalendar(uid, cid)`, `listConnections(uid)` — enforces MAX_CONNECTIONS=10, `syncAvailability(uid, cid, events)` — merges external busy intervals, `pushBookingToExternalCalendars(uid, booking)` — writes confirmed bookings back, `refreshTokens(uid, cid)`. Token storage: encrypted AES-256-GCM via crypto.js. **OAuth tokens encrypted server-side — NOT in client code** (key lives in Cloud Function env) |
| 30 | `services/event-type.service.js` | ~80 | `createEventType`, `updateEventType`, `deleteEventType` (soft: active=false), `listEventTypes`, `getEventType`. Free tier: max 1. Validate event type before save. |
| 31 | `services/booking.service.js` | ~100 | `bookSlot(hostId, date, slotId, inviteeId, bookingData)` — atomic transaction with runTransaction. Creates booking + workspace atomically. `cancelBooking`, `getBooking`, `listBookingsForHost`, `listBookingsForInvitee`. Pre-submit check: verify event type still active. Split PHI from non-PHI data when `requiresPhi`. |
| 32 | `services/availability.service.js` | ~100 | `setWorkingHours`, `getWorkingHours`, `setBookingRules`, `getBookingRules`, `generateAndStoreSlots`, `getAvailableSlots`, `getAvailableSlotsInRange`, `markSlotBusy` |
| 33 | `services/routing.service.js` | ~120 | `createRoutingForm`, `updateRoutingForm`, `getRoutingForm`, `listRoutingForms`, `evaluateRouting` (client-side), `createPool`, `addPoolMember`, `removePoolMember`, `roundRobinAssign(poolId, requestedSlot)` — atomic counter increment + availability check + **fallback**: if assignee busy, try next in priority order, `collectiveCheck` — checks all members free. Priority weighting: higher-priority members get more assignments (weighted round-robin). |
| 34 | `services/workspace.service.js` | ~120 | `createWorkspace`, `getWorkspace`, `addTask`, `toggleTask`, `deleteTask`, `startTimer(mode:'prep'|'session'|'followup')`, `stopTimer`, `getElapsed`, `addMessage`, `getTimeTracking` — aggregates all three timer modes × rate. `uploadFile` — Cloud Storage signed URL for actual file upload (not metadata-only). |
| 35 | `services/notification.service.js` | ~60 | `sendBookingConfirmation(booking)`, `sendCancellationNotice(booking)`, `sendReminder(booking)`, `maskPHIForNotification(booking)` — replaces patient name with `Client ID #xxx`. All calls go to Cloud Function HTTP endpoint `/api/notifications/send`. |
| 36 | `services/webhook.service.js` | ~80 | `subscribeWebhook`, `unsubscribeWebhook`, `listSubscriptions`, `testWebhook`, `generateSigningSecret` |

### Tier 4: Views (16 files)

Each view is a factory function `export function ViewName() { ... return ctrl }` that creates a controller composing shared components + services + its own template. Views emit and listen to messages for cross-component communication.

| # | File | Route | Components Used | States |
|---|------|-------|-----------------|--------|
| 37 | `views/login.js` | `/login` | Spinner, Toast, user-avatar | loading, unauthenticated, authenticated (redirect), error |
| 38 | `views/dashboard.js` | `/` | Spinner, skeleton-card, empty-state, badge, status-dot, toast | loading, loaded, empty, error. KPI cards. No-show rate. Recent bookings. |
| 39 | `views/calendar-connections.js` | `/calendar` | Spinner, skeleton-card, empty-state, modal, confirm-dialog, badge, status-dot, toast | loading, connected, empty, syncing, error, max_reached |
| 40 | `views/event-types.js` | `/event-types` | Spinner, skeleton-card, empty-state, modal, confirm-dialog, badge, search-input, toast, form-field | loading, loaded, empty, creating, editing, error |
| 41 | `views/booking-page-editor.js` | `/event-types/editor` | Spinner, modal, toast, form-field, tab-bar | loading, loaded, saving, error. 3-panel: block palette (Header, Description, Calendar, Form, Testimonials, FAQ, Image, Spacer, Footer) + 375px live preview + properties panel. |
| 42 | `views/availability.js` | `/availability` | Spinner, skeleton-card, date-picker, time-slot-grid, modal, toast, copy-button, tab-bar | loading, loaded, saving, error, month_empty |
| 43 | `views/booking.js` | `/book/:hostId/:eventTypeId` | Spinner, date-picker, time-slot-grid, form-field, modal, toast, user-avatar | loading, date_select, slot_select, form, confirm, success, error, password_gate, slot_taken, event_deleted, no_availability |
| 44 | `views/routing-forms.js` | `/routing-forms` | Spinner, skeleton-card, empty-state, modal, confirm-dialog, search-input, tab-bar, toast, form-field | loading, list, building, preview, saving, error |
| 45 | `views/pools.js` | `/pools` | Spinner, skeleton-card, empty-state, modal, confirm-dialog, search-input, badge, data-table, toast | loading, list, detail, editing, error |
| 46 | `views/workspaces.js` | `/workspaces` | Spinner, skeleton-card, empty-state, badge, toast | loading, loaded, empty, error. Workspace cards: client name, event type, date, task count, last message. |
| 47 | `views/workspace-detail.js` | `/workspaces/:id` | Spinner, skeleton-card, modal, confirm-dialog, badge, status-dot, toast, form-field, copy-button, user-avatar, tab-bar | loading, loaded, timer_running, timer_paused, forbidden, error. 3-column: tasks + timer + messages. |
| 48 | `views/time-tracking.js` | `/time-tracking` | Spinner, skeleton-table, empty-state, badge, pagination, tab-bar, toast | loading, loaded, empty, error |
| 49 | `views/compliance.js` | `/compliance` | Spinner, skeleton-card, modal, badge, status-dot, toast, confirm-dialog | loading, baa_unsigned, baa_signed, saving, error |
| 50 | `views/webhooks.js` | `/webhooks` | Spinner, skeleton-card, empty-state, modal, confirm-dialog, badge, status-dot, toast, form-field, copy-button | loading, loaded, adding, testing, error |
| 51 | `views/api-keys.js` | `/api-keys` | Spinner, skeleton-card, empty-state, modal, confirm-dialog, badge, toast, copy-button | loading, loaded, generating, key_revealed, error |
| 52 | `views/settings.js` | `/settings` | Spinner, modal, confirm-dialog, toast, form-field, user-avatar | loading, loaded, saving, error |

### Tier 5: Cloud Functions (4 files)

| # | File | Trigger | Purpose |
|---|------|---------|---------|
| 53 | `functions/src/dispatch-webhook.js` | `onValueWritten('/bookings/{bookingId}')` | Detects booking create/update/delete. Reads webhook subscriptions for host. Dispatches POST to each subscriber URL with HMAC signature. 3 retries with backoff (5s/30s/300s). Dead letter queue to `/webhook_failures/{sid}`. |
| 54 | `functions/src/enforce-timer-limit.js` | `onValueWritten('/workspaces/{wid}/timers/current/startTime')` + periodic check | If timer runs > 8h, auto-stop server-side. Logs time tracking entry. Sends warning notification via notification service. |
| 55 | `functions/src/send-notification.js` | HTTP trigger `POST /api/notifications/send` | Receives notification request from client. Constructs email via SendGrid/Mailgun template. Masks PHI if applicable. Sends. Logs delivery status to `/notifications/{nid}`. Rate limited per minute per host. |
| 56 | `functions/src/oauth-token-exchange.js` | HTTP trigger `POST /api/oauth/exchange` | Handles OAuth token exchange for Google/Microsoft calendar connections. Receives auth code from client, exchanges for tokens server-side, encrypts with server-side key (AES-256-GCM), stores encrypted blob in RTDB. Client never sees raw tokens. |

### Tier 6: Firebase Config (3 files)

| # | File | Purpose |
|---|------|---------|
| 57 | `database.rules.json` | Full RTDB security rules (all 12 nodes) |
| 58 | `firebase.json` | Project config: RTDB, hosting, functions emulators, rewrites to index.html, rewrite `/api/*` to Cloud Functions |
| 59 | `.env.example` | Documents required env vars: `FIREBASE_API_KEY`, `FIREBASE_DATABASE_URL`, `FIREBASE_PROJECT_ID`, `OAUTH_ENCRYPTION_KEY` (Cloud Function only), `SENDGRID_API_KEY`, `WEBHOOK_SIGNING_SECRET` |

---

## 6. Security Strategy

### 6.1 Output Escaping (mandatory)
- `esc()` in controller.js escapes `<`, `>`, `&`, `"`, `'` for HTML context
- Every user-controlled value in templates wrapped in `esc()`
- Event type titles, user names, email subjects, form fields — all escaped

### 6.2 OAuth Tokens
- **Never stored in client-accessible RTDB in decryptable form**
- OAuth flow: client initiates → Cloud Function handles token exchange → encrypts with server-side key → stores encrypted blob in RTDB
- Client never sees raw access/refresh tokens
- Calendar sync reads encrypted blob, sends to Cloud Function for decryption + API call

### 6.3 API Keys
- Generated client-side: prefix shown once, full key hashed with PBKDF2 (100K iterations) via `crypto.subtle`
- Hash stored in RTDB, raw key never stored
- Auth: compare hash of incoming key against stored hash
- Prefix (`cal_live_`) stored plaintext for identification

### 6.4 Input Validation
- All form fields validated client-side before submit (validators.js)
- Max lengths enforced: name=200, email=254, custom=500
- Unicode normalized to NFC before storage
- RTDB `.validate` rules as defense-in-depth

### 6.5 Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://www.gstatic.com https://cdn.jsdelivr.net;
  style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline';
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.firebaseio.com https://identitytoolkit.googleapis.com https://www.googleapis.com wss://*.firebaseio.com;
  img-src 'self' data: https:;
  frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;
">
```

### 6.6 Route Guards
```js
// Router-level guard (prevents navigation entirely, no flash):
router.guard('*', ({ to }) => {
  const user = getCurrentUser()
  const isPublicRoute = to === '/login' || to.startsWith('/book/')
  if (!user && !isPublicRoute) {
    router.go('/login', { replace: true })
    return false
  }
  return true
})
```

---

## 7. Reliability Strategy

| Concern | Solution |
|---------|----------|
| All async external calls | 10s timeout via `Promise.race` in `dbRead`/`dbWrite` wrappers |
| Retry policy | 3 attempts, 1s/2s/4s exponential backoff with ±30% jitter |
| Idempotency | `runTransaction` for slot booking; all writes use `set` with known key (not `push`) |
| Firebase offline | `onDisconnect` → set `state.firebaseConnected = false` → show offline banner |
| OAuth popup blocked | Catch `auth/popup-blocked` → fallback to `signInWithRedirect` |
| morphdom render failure | try/catch in controller `render()` → fallback to full root replacement |
| onValue subscriptions | Stored in `activeSubscriptions` array → all unsubscribed on route change |
| Timer accuracy | `Date.now()` delta calculation, not interval counting; server-side 8h limit enforcement |
| Webhook delivery | 3 retries with backoff; dead letter queue; delivery status tracking |
| External calendar push-back | Retry once on failure; log to `/sync_failures/{uid}`; surface in calendar connections view |
| Collective availability | Query all members' slots per date in single `get()` call; pre-aggregation via Cloud Function for pools >10 members |

---

## 8. Edge Cases (exhaustive)

| # | Case | Handling |
|---|------|----------|
| 1 | User not authenticated | Router guard → redirect /login |
| 2 | Free tier limits | Event type: max 1; Calendar connection: max 1; UI shows upgrade prompt |
| 3 | Booking slot taken mid-session | `runTransaction` aborts → "Slot just taken" toast + refresh slot list |
| 4 | Network offline | Firebase SDK offline queue; offline banner; stale data indicator |
| 5 | OAuth token expired | Refresh 5min before expiry; retry once; fallback to re-auth prompt |
| 6 | DST spring forward | Slots in skipped hour excluded from generation |
| 7 | DST fall back | Slots in repeated hour use first occurrence |
| 8 | Leap year Feb 29 | JS Date handles natively; `getMonthGrid` tested for 2024, 2028 |
| 9 | No working hours set | Booking page shows "Host hasn't configured availability yet" state |
| 10 | Event type deleted during booking | Pre-submit check: verify event type exists + active; show "No longer available" |
| 11 | Workspace accessed by non-participant | RTDB rules deny read → catch → show "Access denied" (403 state) |
| 12 | Multiple browser tabs | `onValue` subscription updates slot list in real-time across tabs |
| 13 | Browser back during booking | `history.replaceState` for step transitions; wizard state in sessionStorage |
| 14 | Very long inputs | Max lengths enforced: name=200, email=254, custom=500 |
| 15 | Unicode/special chars | `str.normalize('NFC')` before storage; `esc()` on output |
| 16 | Timer left running >8h | Client warning at 8h; Cloud Function auto-stop at 8h server-side |
| 17 | Round-robin pool empty | Fallback to pool owner |
| 18 | Round-robin assignee busy | Fallback: try next member by priority order |
| 19 | API key compromised | Revoke immediately; regenerate new; audit log |
| 20 | Webhook subscriber URL down | 3 retries; dead letter queue; visible in webhook status |
| 21 | Firebase RTDB connection lost | Banner; auto-reconnect; queued writes |
| 22 | Very long month (31 days × 48 slots = 1488 slots) | Paginate slot display by date; load 7 days at a time |
| 23 | Large number of event types (>50) | Search filter + scroll; no pagination needed for <200 |
| 24 | HIPAA mode active | All PHI fields masked in notifications; separate `/secure_phi` write; clinical fields excluded from calendar event titles pushed to external calendars |

---

## 9. Test Strategy

### 9.1 Unit Tests (Jest with Firebase Emulator)
- **Utils**: 100% coverage on Result.js, datetime.js, validators.js, crypto.js
- **Services**: All service functions tested against emulator RTDB with seed data
- **Controllers**: Controller pattern tested for render lifecycle, element onboarding, trigger binding
- **Target**: >85% line coverage overall

### 9.2 Integration Tests
- **Booking race condition**: 10 concurrent `bookSlot()` calls → exactly 1 succeeds, 9 fail with "slot taken"
- **Round-robin fairness**: 1000 assignments → distribution within 5% uniformity (Chi-squared test)
- **Collective availability**: 5 members, 1 conflicting slot → slot correctly excluded
- **Router navigation**: All 16 routes render correct view; guards block unauthenticated access

### 9.3 End-to-End Tests (Playwright)
- Full booking flow: select date → slot → fill form → confirm → success
- Dashboard loads KPIs after booking
- Workspace: create task, start timer, stop timer, verify time tracking
- OAuth calendar connect flow (mock OAuth server)
- Webhook subscription → test dispatch

### 9.4 Security Tests
- XSS: inject `<script>alert(1)</script>` in name, email, event title → verify escaped
- Unauthenticated API access → verify 401/redirect
- Cross-user data access → verify RTDB rules block
- CSP: verify no inline script execution, no external script loading from unlisted domains

---

## 10. Build Order & Dependencies

```
Phase 0 (Foundation):
  index.html → firebase.js → messages/catalog.js → Result.js → icons.js → app.js
  ↓
Phase 1 (Utilities):
  datetime.js, crypto.js, validators.js (all independent)
  ↓
Phase 2a (Shared Components — Pure):
  badge.js, status-dot.js, skeleton-card.js, skeleton-table.js, form-field.js, user-avatar.js
  ↓
Phase 2b (Shared Components — Stateful, no service deps):
  spinner.js, empty-state.js, toast.js, modal.js, confirm-dialog.js, tab-bar.js, search-input.js, pagination.js, copy-button.js
  ↓
Phase 2c (Shared Components — Service deps):
  data-table.js, date-picker.js, time-slot-grid.js
  ↓
Phase 3a (Core Services):
  auth.service.js → event-type.service.js → availability.service.js
  ↓
Phase 3b (Dependent Services):
  calendar.service.js (dep: crypto) → booking.service.js (dep: workspace, availability) → workspace.service.js
  routing.service.js (dep: availability) → webhook.service.js → notification.service.js
  ↓
Phase 4 (Views):
  All 16 views (dep: all components + all services). Build in route frequency order.
  ↓
Phase 5 (Cloud Functions):
  dispatch-webhook.js, enforce-timer-limit.js, send-notification.js
  ↓
Phase 6 (Config):
  database.rules.json, firebase.json, .env.example
```

---

## 11. Verification Gates

Each tier has a gate that must pass before moving to next:

| Tier | Gate |
|------|------|
| Phase 0 | `index.html` loads in browser. Firebase connects. `app.render()` produces DOM. Hash navigation changes route. Messages catalog and icons load without errors. |
| Phase 1 | All util functions return correct values in console. `Result.from().map().unwrap()` chains work. Slots generate DST-safe. |
| Phase 2a | Pure components render correctly. `badge('success')` returns green badge. `skeletonCards(3)` renders 3 pulse cards. |
| Phase 2b | Stateful components work. `Modal().open()` shows dialog, closes on backdrop click. `Toast().success('msg')` auto-dismisses. `Pagination().setTotalPages(5)` renders page buttons. |
| Phase 2c | Data components work. `DataTable().setColumns(cols).setData(rows)` renders sortable table. Date picker selects dates. Time slot grid renders clickable slots. |
| Phase 3a | Auth flow works (sign in, sign out). Event type CRUD persists to RTDB. Slots generate correctly. |
| Phase 3b | Atomic booking prevents double-booking. Round-robin distributes fairly with priority. Timer tracks 3 modes accurately. |
| Phase 4 | Every route navigable. Every view handles loading/empty/error. Mobile renders at 320px without horizontal scroll. XSS vectors escaped. Components reused across views. |
| Phase 5 | Webhook dispatches on booking create. Timer auto-stops at 8h. Notification email sends. |
| Phase 6 | Unauthenticated reads denied. Cross-user writes denied. SPA rewrite works for all routes. |

---

## 12. Feature Gap Analysis vs. Real Calendly

*Research date: 2026-06-16. Sources: Calendly Help Center, Calendly Release Notes, pricing pages.*

### 12.1 Already Covered (in plan)

| Feature | Plan Reference |
|---------|---------------|
| Event Types CRUD | `event-type.service.js`, `/event-types` view |
| Calendar Sync (Google + Microsoft) | `calendar.service.js`, `/calendar` view |
| Availability Management | `availability.service.js`, `/availability` view |
| Round Robin Routing | `routing.service.js`, `/pools` view |
| Collective Scheduling | `routing.service.js` `collectiveCheck()` |
| Routing Forms | `routing.service.js`, `/routing-forms` view |
| Booking Page | `/book/:hostId/:eventTypeId` view |
| Booking Page Editor | `/event-types/editor` view |
| Workspaces (Client Portal) | `workspace.service.js`, `/workspaces/:id` view |
| Time Tracking | workspace timer + `/time-tracking` view |
| HIPAA/PHI Compliance | `/compliance` view + `/secure_phi` RTDB node |
| Webhooks | `webhook.service.js`, `/webhooks` view |
| API Keys / PAT | `/api-keys` view |
| Notifications (email) | `notification.service.js` + Cloud Function |
| Booking Rules (max/day, buffers) | `availability.service.js` `setBookingRules()` |

### 12.2 Missing — Priority 1 (Core Scheduling Gaps)

Features that real Calendly has and users expect in any scheduling platform.

| # | Feature | Calendly Tier | How to Add |
|---|---------|--------------|------------|
| 1 | **Meeting Polls** — invitees vote on multiple time options; host confirms winner | All plans | New view: `/polls`. Service: `poll.service.js`. RTDB node: `/polls/{pid}`. Workflow: host proposes 3-5 times → invitees vote → host picks winner → auto-books |
| 2 | **Group Events** — single host, many invitees (webinars, training). Capacity limit. | Standard+ | Extend event types with `type: 'group'` + `capacity: N`. Booking page shows "X of N spots remaining." No collective check needed (host only). |
| 3 | **One-Off Meetings** — host manually creates a meeting with custom time/date, sends link | All plans | View: `/one-off`. Service: `one-off.service.js`. Host picks date/time → generates single-use link → copies to clipboard. No event type needed. |
| 4 | **Single-Use Links** — time-limited, expire-after-use booking links | All plans | Extend event types with `singleUse: true`. Generate token-based URLs (`/book/otl/{token}`). Token auto-expires after booking or TTL. |
| 5 | **Secret/Hidden Event Types** — not publicly listed, accessible only via direct link | All plans | Add `visibility: 'hidden'` to event type schema. Hidden types excluded from host's public profile. Only accessible via direct `/book/{hostId}/{eventTypeId}` link. |

### 12.3 Missing — Priority 2 (Internal Tool Essentials)

Features useful for internal team scheduling. No payment/revenue features — this is not a commercial product.

| # | Feature | How to Add |
|---|---------|------------|
| 6 | **Video Conferencing Auto-Generate** — Zoom, Meet, Teams links created automatically on booking | Add `location: 'zoom'|'meet'|'teams'` to event type. Service calls respective API on booking creation → stores join link in `/bookings/{bid}/location`. OAuth for Zoom/Teams needed. |
| 7 | **Custom Confirmation Page** — post-booking redirect to internal wiki/page | Add `confirmationUrl` to event type. After booking confirm step → redirect or show embedded custom page. |

### 12.4 Missing — Priority 3 (Enterprise & Admin)

Features that make the platform enterprise-ready.

| # | Feature | Calendly Tier | How to Add |
|---|---------|--------------|------------|
| 11 | **Team Reporting & Analytics** — usage dashboards per team member, booking volume, no-show rate | Teams+ | Extend dashboard with team filter. Service: `analytics.service.js`. Aggregate `/bookings` by team, date range, status. Show charts (D3.js or Chart.js). |
| 12 | **Admin-Managed Events** — admin creates event template, pushes to all team members, locks fields | Teams+ | Add `managedBy` and `locked` fields to event type. Admin CRUD on `/managed_events/{uid}/{eid}`. Team members see read-only fields + can only toggle active. Sync changes with `onValue` subscription. |
| 13 | **Groups & Permissions** — role-based access within team (admin, member, viewer) | Teams+ | Extend `/users/{uid}` with `teamId` + `role: 'admin'|'member'|'viewer'`. Team admin can manage members, event types, time tracking. Viewer = read-only dashboard. |
| 14 | **Contacts / CRM** — contact profiles, notes, custom fields, lists | All plans | New view: `/contacts`. RTDB: `/contacts/{uid}/{cid}`. Fields: name, email, phone, company, notes, customFields, lastBooking, totalBookings. List segments. Filter/sort. |
| 15 | **No-Show Rate Tracking** — track attendance metrics per host, event type, team | Teams+ | Add `status: 'no_show'` to bookings. Dashboard KPI: no-show %. Host can mark invitee as no-show post-meeting. Trigger automated no-show follow-up email. |

### 12.5 Missing — Priority 4 (Distribution & Reach)

Features that expand how the platform is accessed.

| # | Feature | Calendly Tier | How to Add |
|---|---------|--------------|------------|
| 16 | **Embed on Website** — inline or pop-over booking widget | All plans | Create `embed.js` — standalone script that mounts booking page in iframe or shadow DOM. Configurable: `data-cal-link`, `data-cal-layout` (inline/popup). PostMessage for height resize. |
| 17 | **SMS Reminders** — text message follow-ups 24h/1h before meeting | Standard+ | Extend notification service with Twilio integration. RTDB: `/notification_prefs/{uid}/sms`. Cloud Function sends SMS via Twilio API. |
| 18 | **Mobile Apps** (PWA) — installable progressive web app | All plans | Add `manifest.json` + service worker for offline caching. Already mobile-responsive design. Add to home screen prompt. |
| 19 | **Browser Extension** — Chrome extension for Gmail sidebar booking | — | Separate project: Chrome extension using Calendly API. Injects "Book a Meeting" button in Gmail compose. Reads email recipient → pre-fills invitee. |

### 12.6 Missing — Priority 5 (Advanced & AI)

Future-differentiating features.

| # | Feature | Calendly Tier | How to Add |
|---|---------|--------------|------------|
| 20 | **AI Notetaker** — AI-generated meeting summaries from calendar event description | — | Cloud Function reads booking details + workspace notes → generates summary via LLM API → stores in workspace. |
| 21 | **ChatGPT / AI Assistant** — book meetings via conversational AI | — | Expose booking API endpoint. ChatGPT plugin or custom GPT action that calls `/api/bookings` with natural language → returns confirmation. |
| 22 | **Audit Logging** — compliance trail of all admin actions | Enterprise | RTDB: `/audit_logs/{timestamp}`. Log: userId, action, target, oldValue, newValue, ip. Immutable append-only. Retention: 1 year. |
| 23 | **SSO (SAML/OIDC)** — enterprise single sign-on | Enterprise | Firebase Auth supports SAML via Google Cloud Identity Platform. Configure SAML provider in Firebase Console. Route: `/login/sso`. |
| 24 | **SCIM Provisioning** — automated user lifecycle management | Enterprise | Cloud Function HTTP endpoint for SCIM 2.0 protocol: `/api/scim/v2/Users`, `/api/scim/v2/Groups`. Create/update/deactivate users from identity provider (Okta, Azure AD). |

### 12.7 Updated File Plan (additions)

These features require new files beyond the 59 in the core plan (Phase 0-6):

| # | File | Purpose |
|---|------|---------|
| 57 | `assets/src/services/poll.service.js` | Meeting poll CRUD, vote tallying, winner selection |
| 58 | `assets/src/services/contact.service.js` | Contact CRUD, notes, custom fields, list management |
| 59 | `assets/src/services/analytics.service.js` | Team reporting, KPI aggregation, chart data |
| 60 | `assets/src/views/polls.js` | Poll creation + voting UI |
| 61 | `assets/src/views/contacts.js` | Contact list, detail, notes, segments |
| 62 | `assets/src/views/one-off.js` | One-off meeting creation form |
| 63 | `assets/src/views/team-analytics.js` | Team dashboard with charts |
| 64 | `assets/embed.js` | Embeddable booking widget |
| 65 | `manifest.json` | PWA manifest |
| 66 | `sw.js` | Service worker for offline PWA |
| 67 | `functions/src/send-sms-reminder.js` | Twilio SMS dispatch |

**New total**: ~67 files (up from 59 core). Phase: these are Phase 7+ additions — implement after the core platform is stable.

### 12.8 Updated Route Definitions

Add to `router.js` routes:

```js
'/polls':              pollsView,
'/polls/:id':          pollDetailView,
'/contacts':           contactsView,
'/contacts/:id':       contactDetailView,
'/one-off':            oneOffView,
'/team-analytics':     teamAnalyticsView,
'/book/otl/:token':    singleUseBookingView,     // Single-use link
'/embed/:hostId/:eventTypeId': embedBookingView, // Embed version
```

### 12.9 Revenue Stripping — Internal Tool Adjustments

The following revenue/payment features are removed or repurposed for internal use:

| Item | Action |
|------|--------|
| Event type `price` / `currency` fields | **Removed** — not needed for internal scheduling |
| `/billing` view | **Repurposed** → `/time-tracking` — shows tracked hours per workspace/team member, no invoices |
| Workspace `billing` RTDB node | **Repurposed** → just stores timer logs and elapsed hours |
| Payment Processing service | **Not built** |
| Meeting Packages | **Not built** |
| Payment Links | **Not built** |
| Stripe/PayPal integration | **Not built** |

**Kept for internal use:**
- Time tracking (prep/session/follow-up timers)
- Workspace task management
- Team analytics (booking volume, no-show rate, utilization)
- Video conferencing auto-generate (Meet, Zoom, Teams)

### 12.10 Gemini Adversarial Review — Findings & Actions

*Reviewed 2026-06-16. Each critique applied below.*

#### Architecture (3 issues)

| # | Finding | Severity | Action |
|---|---------|----------|--------|
| A1 | **Spaghetti event mesh** — 14 views using `ctrl.message()`/`ctrl.on()` pub/sub without a centralized state machine will devolve into untraceable event flows, race conditions, and memory leaks | Major | Add a centralized `EventBus` that logs all messages, enforces named channels, and validates subscriber cleanup. All `ctrl.message()` calls route through the bus. |
| A2 | **56 unbundled files = 56 HTTP requests** — ES modules without a bundler create a critical rendering path bottleneck. Import chains produce sequential waterfall loading. | Major | Add Vite (zero-config) as a dev dependency for bundling. Single `assets/dist/bundle.js` output. Keep source in `assets/src/` for development. |
| A3 | **morphdom shreds child controllers** — `ctrl.render(partialState)` on a parent triggers morphdom which replaces child DOM nodes, wiping out their local controller state and event listeners | Blocker | Parent controllers must NOT own child controller DOM. Child controllers self-mount into placeholder elements (`data-cid`). Parent `render()` only updates its own DOM; children manage themselves via message subscriptions. |

#### Reliability (3 issues)

| # | Finding | Severity | Action |
|---|---------|----------|--------|
| R1 | **Nested retry loops** — Application-level retry (3x with backoff) overlaps with Firebase SDK's built-in retry. Combined they produce 9 total attempts with multiplicative delay. | Major | Remove application-level retry for Firebase operations. Firebase SDK handles connection retry natively. Keep timeout wrapper only. Add retry ONLY for non-Firebase external calls (OAuth, webhook dispatch, calendar API). |
| R2 | **Promise.race timeout doesn't cancel requests** — Abandoned promises continue executing, consuming Firebase connection slots during slowdowns. | Major | Use `AbortController` with Firebase `get()` options where supported. For `runTransaction`, enforce a max-wait guard that rejects stale transactions rather than racing. |
| R3 | **Subscription cleanup race** — Late-resolving `onValue` callback from previous route fires after navigation, targeting unmounted component state. | Major | Add a route-generation counter. Each subscription callback checks if its generation matches the current route generation before applying state updates. |

#### Feature Priority Realignment

| # | Finding | Action |
|---|---------|--------|
| F1 | **SSO/SAML + Audit Logging are P1, not P5** — Enterprise internal tools require SSO and audit trails at launch | Promote to Priority 1 |
| F2 | **Resource Booking is a critical gap** — Meeting rooms, equipment, shared spaces are essential for internal scheduling | Add to Priority 1: `resource.service.js`, `/resources` view. RTDB: `/resources/{rid}` with booking conflict check. |
| F3 | **Video conferencing auto-generate is P1** — Internal meetings need Meet/Zoom links instantly, not as Priority 2 | Promote to Priority 1 |
| F4 | **Demote Meeting Polls, SMS, Embed Widget** — Internal teams use Slack/Teams/Email, not consumer scheduling patterns | Demote to Priority 3 |
| F5 | **Priority 1 reordered** → (1) SSO/SAML, (2) Audit Logging, (3) Resource Booking, (4) Video Conferencing, (5) Contacts/CRM, (6) Single-Use Links | Update plan |

### 12.11 Design Token Update

The Linear-inspired dark palette ([`index.html`](file:///home/amir/Documents/Calendly%20v2/index.html)) applied:

| Token | Value | Role |
|-------|-------|------|
| `bg` | `#080710` | Deep obsidian background |
| `surface` | `#12111A` | Layered charcoal cards/sidebar |
| `surface-raised` | `#1A1923` | Elevated inputs/modals |
| `accent` | `#7047EB` | Electric violet CTAs/links |
| `text-primary` | `#F4F3F6` | Off-white headings/body |
| `text-muted` | `#8A8993` | Cool slate captions |
| `border` | `#262431` | Subtle dark strokes |
| `success` | `#00C48C` | Teal mint confirmations |
| `danger` | `#FF4A5A` | Neon coral errors |
| `warning` | `#F5A623` | Amber warnings |

Fonts: Geist (headings, 700) + gilroy (body, 400). 4px base grid. 10px default radius.
