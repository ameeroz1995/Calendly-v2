# Calendly v2 — Architecture & Implementation Spec

## Goal
A next-generation enterprise lifecycle management & scheduling platform that combines automated booking with post-meeting workspace, time-tracking, and billing. Pure JS + Firebase RTDB + morphdom controller pattern + hash router.

## Language & Environment
- **Language**: Vanilla JavaScript ES6+ (ES2024 where available: `Promise.withResolvers`, `Object.groupBy`)
- **No TypeScript**, no frameworks (React, Vue, Angular)
- **Runtime**: Browser (Firebase Web SDK v10+), Node.js (Cloud Functions)
- **CSS**: Tailwind CSS v3 via CDN
- **Module system**: ES modules (`import`/`export`)
- **DOM diffing**: morphdom (already used in controller.js)

## Architecture Pattern: Modular Frontend Monolith + Service Layer

```
┌─────────────────────────────────────────────────────┐
│  index.html (shell + Tailwind CDN + Firebase SDKs)   │
├─────────────────────────────────────────────────────┤
│  app.js (bootstrap: controller + router + auth)      │
├──────────┬──────────┬──────────┬────────────────────┤
│  Views/  │ Services/│  Utils/  │  Firebase RTDB     │
│  13 view │ auth,    │  Result, │  (realtime sync)   │
│  files   │ calendar,│  crypto, │                    │
│          │ booking, │  datetime│                    │
│          │ workspace│          │                    │
└──────────┴──────────┴──────────┴────────────────────┘
```

**Why not MVC**: With controller.js already handling state+template+morphdom, a full MVC would be over-architected. Each view template is a pure function taking `({ state, fn })` returning HTML string. Services handle Firebase I/O. The controller is the binding layer.

## Controller Pattern (mandated)
```js
// Every view follows this exact pattern:
function myViewTemplate({ state, fn }) {
  return html`<div id="my-view" class="...">...</div>`
}

// Main app controller:
const app = controller({
  template({ state, fn }) {
    const viewFn = router.match(state.route)
    return viewFn ? viewFn({ state, fn }) : html`<div>404</div>`
  },
  state: { route: '/', user: null, /* ... */ },
  methods: { handleLogin, handleLogout, /* ... */ }
})

// Router wires navigation to state:
router.onChange(({ path, params, query }) => {
  app.render({ route: path, currentParams: params, currentQuery: query })
})
```

## Router Pattern (mandated)
```js
const router = createRouter({
  routes: {
    '/':                 () => dashboardView,
    '/login':            () => loginView,
    '/calendar':         () => calendarConnectionsView,
    '/event-types':      () => eventTypesView,
    '/event-types/:id':  () => eventTypeDetailView,
    '/availability':     () => availabilityView,
    '/book/:hostId/:eventTypeId': () => bookingView,
    '/routing-forms':    () => routingFormsView,
    '/routing-forms/:id':() => routingFormDetailView,
    '/pools':            () => poolsView,
    '/workspaces/:id':   () => workspaceView,
    '/billing':          () => billingView,
    '/compliance':       () => complianceView,
    '/webhooks':         () => webhooksView,
    '/api-keys':         () => apiKeysView,
    '/settings':         () => settingsView,
  },
  initial: '/',
  useHash: true,
})
```

## Firebase RTDB Schema (flat, denormalized for RTDB best practices)

```
/users/{uid}                   → { name, email, tier, timezone, createdAt }
/event_types/{uid}/{eid}       → { title, duration, price, currency, requiresPhi, color, active }
/availability/{uid}/{date}/{sid} → { startTime, endTime, status:'free'|'booked', bookingId }
/calendar_connections/{uid}/{cid} → { provider, email, accessToken:ENCRYPTED, refreshToken:ENCRYPTED, lastSync }
/booking_rules/{uid}           → { maxPerDay: 3, minNotice: 2, maxAdvance: 60, bufferMinutes: 15 }
/bookings/{bid}                → { hostId, inviteeId, eventTypeId, slotId, date, status, workspaceId, createdAt }
/routing_forms/{fid}           → { hostId, title, questions:[], rules:{}, targetPool }
/routing_pools/{pid}           → { hostId, name, members:{uid:priority}, strategy:'round_robin'|'collective' }
/routing_counters/{pid}/{uid}  → { count: N }  // atomic round-robin counter
/workspaces/{wid}              → { bookingId, hostId, clientId, tasks:{}, messages:{}, files:{}, billing:{} }
/secure_phi/{bid}              → { symptoms:ENC, medications:ENC, notes:ENC, signedBaa:bool, baaSignedAt }
/webhook_subscriptions/{uid}/{sid} → { url, events:{ invitee.created, invitee.canceled, routing.submitted }, secret }
/api_keys/{uid}/{kid}          → { name, prefix, hash, scopes:[], createdAt, lastUsedAt }
```

## Error Strategy
- Fluent `Result` / `AsyncResult` chains for all Firebase operations
- `unwrapOr(fallback)` at view boundary — views never see raw errors
- `tapErr()` for structured error logging
- Timeout on all external calls (OAuth, calendar sync)
- Retry with exponential backoff + jitter for network operations

## Reliability Strategy
- All Firebase reads: 10s timeout via `Promise.race`
- All Firebase writes: idempotent (use transactions for slot booking)
- Retry policy: 3 attempts, 1s/2s/4s backoff with ±30% jitter
- Firebase `.onValue()` subscriptions: auto-cleanup on route change (unsubscribe in controller.on('destroy'))
- Calendar OAuth tokens: refresh 5min before expiry, retry refresh once

## Security Strategy
- Firebase RTDB security rules enforce all authorization at server level
- OAuth tokens stored encrypted (AES-256-GCM, key from env)
- PHI data: separate `/secure_phi` node with strict read rules
- Input validation at every form boundary (both client-side preview + server-side Firebase validate rules)
- API keys: hashed with SHA-256, only prefix stored in plaintext
- No secrets in client code — Firebase config is the only public config

## Performance Strategy
- morphdom minimizes DOM operations (only changed elements re-render)
- Debounced search inputs (300ms)
- Firebase `.onValue()` for real-time updates (no polling)
- Booking page: load only current date's slots, paginate forward
- Workspace files: signed URLs for large uploads (optional Cloud Storage integration)

## Inputs/Outputs

### Views receive via `state`:
- `route` — current path
- `user` — auth user object or null
- `currentParams` — URL params from router
- `currentQuery` — URL query string parsed
- View-specific state (e.g., `eventTypes`, `slots`, `workspace`)

### Views output:
- HTML string via `html` tagged template literal
- User actions via `fn.method()` in onclick handlers

### Services:
- Input: Firebase ref + params
- Output: `AsyncResult<T>` or `Result<T>`

## File Plan (33 files)

### Foundation (4 files)
1. `index.html` — Shell, Tailwind CDN, Firebase SDKs, root mount
2. `assets/src/app.js` — Bootstrap, main controller, router wiring
3. `assets/src/firebase.js` — Firebase init, auth state listener, DB refs
4. `assets/src/utils/Result.js` — Result/AsyncResult fluent error handling

### Services (8 files)
5. `assets/src/services/auth.service.js` — Google OAuth, sign in/out, token management
6. `assets/src/services/calendar.service.js` — Calendar connections CRUD, sync logic
7. `assets/src/services/event-type.service.js` — Event type CRUD
8. `assets/src/services/booking.service.js` — Slot booking with atomic transaction
9. `assets/src/services/availability.service.js` — Slot generation, availability queries
10. `assets/src/services/routing.service.js` — Round-robin assignment, routing form logic
11. `assets/src/services/workspace.service.js` — Workspace CRUD, tasks, billing
12. `assets/src/services/webhook.service.js` — Webhook subscription management

### Utils (3 files)
13. `assets/src/utils/datetime.js` — Timezone conversion, slot math, date formatting
14. `assets/src/utils/crypto.js` — AES-256-GCM encrypt/decrypt, SHA-256 hash
15. `assets/src/utils/validators.js` — Input validation helpers

### Views (13 files)
16. `assets/src/views/login.js` — Google OAuth login screen
17. `assets/src/views/dashboard.js` — KPI cards (bookings today, pending, revenue)
18. `assets/src/views/calendar-connections.js` — List + connect/disconnect OAuth calendars
19. `assets/src/views/event-types.js` — Event type list + create/edit form
20. `assets/src/views/availability.js` — Calendar view showing slots, set working hours
21. `assets/src/views/booking.js` — Public booking page (select slot, fill form, confirm)
22. `assets/src/views/routing-forms.js` — Form builder, routing rules editor
23. `assets/src/views/pools.js` — Round-robin pool management
24. `assets/src/views/workspace.js` — Client portal (tasks, timer, messages)
25. `assets/src/views/billing.js` — Invoice list, payment status
26. `assets/src/views/compliance.js` — BAA signing, PHI settings
27. `assets/src/views/webhooks.js` — Webhook subscription CRUD
28. `assets/src/views/api-keys.js` — PAT management

### Firebase Config (2 files)
29. `database.rules.json` — RTDB security rules
30. `firebase.json` — Firebase project config

## Edge Cases (system-wide)
- User not authenticated → redirect to /login
- User on free tier → limit 1 event type, 1 calendar connection
- Booking slot taken mid-session → atomic transaction rejects, show "slot taken" toast
- Network offline → Firebase SDK queues writes, retries on reconnect
- OAuth token expired → auto-refresh with retry, fallback to re-auth prompt
- Large number of event types (>50) → paginated list with search
- HIPAA mode: all PHI fields must be masked in notifications
- Workspace timer left running → auto-stop after 8h with warning prompt
- Round-robin pool empty → fallback to pool owner
- API key compromised → regenerate with confirmation, revoke old immediately

## Testing Strategy
- Manual verification via /verify skill after each major file
- Firebase emulator for local development
- Check: auth flow, slot booking race condition, router navigation, timer accuracy

## Dependencies (CDN + npm for Cloud Functions only)
**CDN** (index.html):
- Firebase App, Auth, Database (v10.x)
- morphdom
- Tailwind CSS v3

**No npm build step for frontend** — pure ES modules loaded directly in browser.

## Design Tokens (from /ui-designer)
- Primary: indigo-600 (#4F46E5), hover: indigo-700
- Success: emerald-500, Warning: amber-500, Danger: red-600
- Background: gray-50, Surface: white, Border: gray-200
- Text: gray-900 (primary), gray-600 (secondary), gray-400 (disabled)
- Radius: rounded-lg (8px) for cards, rounded-md (6px) for inputs/buttons
- Shadow: shadow-sm for cards, focus:ring-2 focus:ring-indigo-500 for inputs
- Spacing: 4px grid (p-4=16px, p-6=24px, gap-4=16px, gap-6=24px)
