# Phase 2: Services Layer

## Goal
All Firebase I/O lives here. Every function returns `AsyncResult`. No view code. No DOM access. Error handling, timeout, retry on every external call.

## Pattern (every service follows this)

```js
import { auth, rtdb, dbRef, dbRead, dbWrite, dbUpdate, dbRemove, dbTransaction } from '../firebase.js'
import { AsyncResult } from '../utils/Result.js'

const TIMEOUT_MS = 10000
const MAX_RETRIES = 3
const RETRY_BASE_MS = 1000

function withRetry(fn) {
  return AsyncResult.from(async () => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const [result, err] = await AsyncResult.from(fn).unwrap()
      if (!err) return result
      if (attempt === MAX_RETRIES) throw err
      const jitter = (Math.random() * 0.6) - 0.3  // ±30%
      await new Promise(r => setTimeout(r, RETRY_BASE_MS * Math.pow(2, attempt - 1) * (1 + jitter)))
    }
  })
}

// Every exported function:
export function someServiceFunction(params) {
  return withRetry(() => dbWrite(`/path/${param}`, data))
    .map(result => transformResult(result))
    .tapErr(err => console.error('[service] someServiceFunction failed:', err.message))
}
```

## Files

### task-007: `auth.service.js`
- `signInWithGoogle()` → opens Firebase Google popup → on first sign-in, creates user profile in `/users/{uid}` → `AsyncResult<User>`
- `signOut()` → `AsyncResult<void>`
- `getCurrentUser()` → sync, returns Firebase user or null
- `createUserProfile(uid, {name, email, tier, timezone})` → `AsyncResult<void>`
- `getUserProfile(uid)` → `AsyncResult<UserProfile>`
- `onAuthChange(callback)` → registers Firebase `onAuthStateChanged` listener → returns unsubscribe function
- `upgradeTier(uid, tier)` → `AsyncResult<void>`
- **Tier defaults**: `'free'` for new users. Admin override via email check.

### task-008: `calendar.service.js`
- `connectCalendar(uid, provider)` → builds OAuth URL, redirects. Provider: `'google'` | `'microsoft'`.
- `handleOAuthCallback()` → parses URL params for code, exchanges for tokens, encrypts with AES-256-GCM, stores to `/calendar_connections/{uid}/{cid}`
- `disconnectCalendar(uid, cid)` → removes connection node, cleans up synced slots
- `listConnections(uid)` → reads `/calendar_connections/{uid}` → `AsyncResult<Connection[]>`
- `syncAvailability(uid, cid, events)` → merges external busy intervals into `/availability/{uid}/{date}` slots (marks overlapping slots as 'external_busy')
- `refreshTokens(uid, cid)` → uses refresh token to get new access token, updates encrypted storage
- **Token encryption**: AES-256-GCM with key from env. Store `{accessToken: encrypted, refreshToken: encrypted, expiresAt, provider, email}`

### task-009: `event-type.service.js`
- `createEventType(uid, data)` → validates → pushes to `/event_types/{uid}/{eid}` → `AsyncResult<EventType>`
- `updateEventType(uid, eid, data)` → partial update → `AsyncResult<EventType>`
- `deleteEventType(uid, eid)` → sets `active: false` (soft delete, bookings reference them)
- `listEventTypes(uid)` → reads `/event_types/{uid}` → filters active → `AsyncResult<EventType[]>`
- `getEventType(uid, eid)` → `AsyncResult<EventType>`
- **Free tier limit**: check count before create, reject if >= 1
- **Defaults**: duration=30, color='#004eba', requiresPhi=false, currency='USD', price=0

### task-010: `booking.service.js`
- `bookSlot(hostId, date, slotId, inviteeId, bookingData)` → **atomic transaction**:
  1. `runTransaction` on `/availability/{hostId}/{date}/{slotId}`: check status === 'free', set to 'booked'
  2. If committed: write `/bookings/{bid}` with hostId, inviteeId, eventTypeId, slotId, date, status:'confirmed', workspaceId
  3. Create workspace via `createWorkspace(bid, hostId, inviteeId)`
  4. Return `{bookingId, workspaceId}`
- `cancelBooking(bid)` → sets status:'cancelled' on booking → sets slot back to 'free'
- `getBooking(bid)` → `AsyncResult<Booking>`
- `listBookingsForHost(uid)` → query `/bookings` where hostId=uid
- `listBookingsForInvitee(email)` → query `/bookings` where inviteeEmail=email
- **Double-booking prevention**: Transaction aborts if slot.status !== 'free'. Returns specific error 'Slot already taken'.

### task-011: `availability.service.js`
- `setWorkingHours(uid, dayOfWeek, {start, end})` → writes to `/booking_rules/{uid}/workingHours/{day}`
- `getWorkingHours(uid)` → reads working hours config
- `setBookingRules(uid, {maxPerDay, minNoticeHours, maxAdvanceDays, bufferMinutes})` → writes to `/booking_rules/{uid}`
- `getBookingRules(uid)` → reads booking rules
- `generateAndStoreSlots(uid, date, eventTypeConfig)` → generates slots using `datetime.generateSlots()`, stores each to `/availability/{uid}/{date}/{slotId}`
- `getAvailableSlots(uid, date)` → reads `/availability/{uid}/{date}`, returns only slots with status='free'
- `getAvailableSlotsInRange(uid, startDate, endDate)` → iterates dates, returns all free slots
- `markSlotBusy(uid, date, slotId, reason)` → sets status='external_busy' (for calendar sync)

### task-012: `routing.service.js`
- `createRoutingForm(uid, {title, questions, rules, targetPool})` → stores to `/routing_forms/{fid}`
- `updateRoutingForm(fid, data)` → partial update
- `getRoutingForm(fid)` → reads form definition
- `listRoutingForms(uid)` → reads forms for host
- `evaluateRouting(formId, answers)` → loads form → applies rules to answers → returns `{poolId, matchedRule}`
- `createPool(uid, {name, strategy})` → stores to `/routing_pools/{pid}`
- `addPoolMember(pid, uid, priority)` → adds to pool members with priority weight
- `removePoolMember(pid, uid)` → removes from pool
- `roundRobinAssign(poolId)` → **atomic transaction**: reads all member counters, picks lowest, increments counter atomically → returns assigned host uid
- `collectiveCheck(poolId, dateRange)` → for each slot, checks if ALL pool members are free → returns only universally free slots

### task-013: `workspace.service.js`
- `createWorkspace(bookingId, hostId, clientId)` → writes `/workspaces/{wid}` with empty tasks, messages, billing
- `getWorkspace(wid)` → reads workspace
- `listWorkspacesForHost(uid)` → queries workspaces by hostId
- `addTask(wid, {title, assignedTo})` → pushes task with `completed: false`
- `toggleTask(wid, taskId)` → flips `completed` boolean
- `deleteTask(wid, taskId)` → removes task node
- `startTimer(wid)` → writes `timers/current/startTime` + `timers/current/status: 'running'`
- `stopTimer(wid)` → calculates elapsed, adds to `timers/log/{id}`, clears current
- `getElapsed(wid)` → reads current timer, calculates elapsed including ongoing time
- `addMessage(wid, {senderId, text})` → pushes message with timestamp
- `getBilling(wid)` → aggregates timer logs × host rate → returns `{totalHours, amount, currency, status}`
- **Auto-stop**: Timer running > 8h triggers warning, stops at 12h

### task-014: `webhook.service.js`
- `subscribeWebhook(uid, {url, events, secret})` → validates URL → stores to `/webhook_subscriptions/{uid}/{sid}`
- `unsubscribeWebhook(uid, sid)` → removes subscription node
- `listSubscriptions(uid)` → reads subscriptions for host
- `testWebhook(url, secret, events)` → sends POST with test payload → returns response status/body
- `generateSecret()` → creates random signing secret for payload verification
- **Payload format**: `{event, timestamp, bookingId, data}` with HMAC-SHA256 signature header

## Shared Conventions
- Every function: `AsyncResult` return type
- Every Firebase write: 10s timeout via `dbWrite` wrapper
- Every failed operation: logged via `.tapErr()`, not swallowed
- Retry only idempotent operations (reads, atomic transaction writes — NOT plain writes that could duplicate)
- Named constants for all paths, timeouts, retry counts
