# Phase 1: Utilities

## Goal
Fluent error handling, datetime math, input validation. Used by every service and view. Zero Firebase dependencies.

## Files

### task-004: `assets/src/utils/Result.js`

#### Result (synchronous)
```js
Result.from(thunk)          // thunk → Result. Catches sync throws.
Result.ok(value)            // Wrap known success value
Result.err(error)           // Wrap known error

.map(fn)       // Transform value. Skip if errored. Catches mapper throws.
.flatMap(fn)   // fn returns Result. Flatten nested Results.
.mapErr(fn)    // Transform error. Skip if ok.
.tap(fn)        // Side-effect on value (errors swallowed). For logging.
.tapErr(fn)     // Side-effect on error (errors swallowed). For error logging.
.recover(fn)    // fn(err) → new Result. Pass through if ok.
.unwrap()       // → [value, error] tuple
.unwrapOr(val)  // → value | fallback if errored
```

#### AsyncResult (asynchronous)
Same API but `.from()` accepts async thunks. All `.map()`/`.tap()` callbacks can be async. `.unwrap()` returns `Promise<[value, error]>`. Additional `.unwrapOrThrow()` rejects if errored. `.fromPromise(promise)` for already-created promises.

#### Key behaviors
- Errors in `.map()`/`.flatMap()`/`.tap()` mappers are caught and converted to errored Result
- Errors in `.tapErr()`/`.mapErr()` are silently swallowed (they're logging, not transformation)
- `.recover()` only runs if errored; passes through if ok
- Chain is lazy until `.unwrap()` or `.unwrapOr()` called (for AsyncResult)

### task-005: `assets/src/utils/datetime.js`

- `generateSlots({ date, workingHours: {start, end}, durationMinutes, bufferMinutes })` → array of `{startTime: ISO, endTime: ISO}`
- `formatDate(isoString, timezone)` → human-readable date string
- `formatTime(isoString, timezone)` → human-readable time string
- `toISODate(date)` → `YYYY-MM-DD` string
- `addMinutes(isoString, minutes)` → new ISO string
- `getDatesInRange(startDate, endDate)` → array of `YYYY-MM-DD` strings
- `isSlotOverlapping(slotA, slotB)` → boolean
- `groupSlotsByDate(slots)` → `{ [date]: slots[] }`
- `getMonthGrid(year, month)` → 6×7 array for calendar rendering
- `TIMEZONES` → constant array of IANA timezone strings

### task-006: `assets/src/utils/validators.js`

- `validateEmail(email)` → `{valid, errors}`
- `validateUrl(url)` → `{valid, errors}`
- `validateRequired(value, fieldLabel)` → `{valid, errors}`
- `validateMinLength(value, min, fieldLabel)` → `{valid, errors}`
- `validateMaxLength(value, max, fieldLabel)` → `{valid, errors}`
- `validateEventType(data)` → validates all event type fields
- `validateBookingForm(formFields, formData)` → validates dynamic form fields
- `validateTimeFormat(timeStr)` → checks HH:MM format
- `validateWebhookUrl(url)` → URL + HTTPS check
- All return `{valid: boolean, errors: [{field: string, message: string}]}`

## Code Constraints
- No Firebase imports
- All pure functions (no side effects, no DOM access)
- No functions over 30 lines
- Named constants for all magic numbers
- Exported as named exports
