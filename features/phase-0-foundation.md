# Phase 0: Foundation Shell

## Goal
App loads in browser → Firebase connects → Auth works → Router navigates. Every subsequent phase depends on this.

## Files

### task-001: `index.html`
- **Purpose**: Shell document loaded by browser. All CDN deps, root mount point.
- **CDN Dependencies**:
  - Tailwind CSS v3 (Play CDN or standalone)
  - Firebase App, Auth, Database v10 (modular SDK)
  - morphdom
- **Fonts**: Geist (headings), gilroy (body) — loaded via @font-face or CDN
- **Meta**: viewport, charset, title "Calendly v2"
- **Structure**: `<body class="bg-white text-[#0a0a0a]"><div id="app"></div><script type="module" src="assets/src/app.js"></body>`
- **Import map**: Map bare specifiers (`firebase/`, `morphdom`) for ES modules

### task-002: `assets/src/firebase.js`
- **Purpose**: Single file for Firebase init. Every other file imports from here.
- **Imports**: `initializeApp`, `getAuth`, `getDatabase`, `ref`, `get`, `set`, `update`, `remove`, `onValue`, `runTransaction`, `query`, `orderByChild`, `equalTo` from Firebase SDK
- **Config**: Firebase config object (apiKey, authDomain, databaseURL, projectId from env or inline)
- **Exports**:
  - `auth` — Firebase Auth instance
  - `rtdb` — Firebase RTDB instance
  - `dbRef(path)` — convenience: `ref(rtdb, path)`
  - `dbRead(path)` — `AsyncResult.from(() => get(dbRef(path)))` with 10s timeout
  - `dbWrite(path, data)` — `AsyncResult.from(() => set(dbRef(path), data))` with 10s timeout
  - `dbUpdate(path, data)` — `AsyncResult.from(() => update(dbRef(path), data))`
  - `dbRemove(path)` — `AsyncResult.from(() => remove(dbRef(path)))`
  - `dbTransaction(path, txFn)` — `AsyncResult.from(() => runTransaction(dbRef(path), txFn))`
  - `onValueSubscription(path, cb)` — returns unsubscribe function
- **Timeout wrapper**: `withTimeout(promise, ms)` using `Promise.race`

### task-003: `assets/src/app.js`
- **Purpose**: Bootstrap. Creates controller + router. Wires them together. Mounts to DOM.
- **Imports**: controller.js, router.js, firebase.js, all 13 view files, auth.service.js
- **Router config**: 13 routes mapped to view functions (see tasks.json phase-3)
- **Controller config**: template resolves route → calls matched view function → returns HTML string. Default state: `{ route: '/', user: null, loading: true }`
- **Auth wiring**: `onAuthChange` → update `state.user` → `app.render({user})`
- **Route guard**: If `state.user` is null and route is not `/login` or `/book/*`, redirect to `/login`
- **Mount**: `document.getElementById('app').replaceWith(app.element())`
- **Exports**: `app` controller instance, `router` instance

## Interdependencies
```
index.html → loads app.js → imports firebase.js + controller.js + router.js + views
```

## Verification
1. Open `index.html` in browser
2. Check: Firebase initializes without error (Network tab)
3. Check: Hash navigation changes route
4. Check: Auth state listener fires
5. Check: No console errors
