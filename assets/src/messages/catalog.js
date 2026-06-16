/**
 * Message Catalog & Centralized EventBus
 *
 * All cross-component messages route through this EventBus.
 * Named channels, logged dispatch, validated subscriber cleanup.
 * Route-generation counter prevents stale callbacks from
 * late-resolving async ops targeting unmounted views.
 */

// ── Message Constants ────────────────────────────────────────────

export const MSG = Object.freeze({
  // Auth
  AUTH_CHANGED:       'auth:changed',

  // Booking
  BOOKING_CREATED:    'booking:created',
  BOOKING_CANCELLED:  'booking:cancelled',

  // Slot selection
  SLOT_SELECTED:      'slot:selected',
  DATE_SELECTED:      'date:selected',

  // UI
  SHOW_TOAST:         'toast:show',
  SEARCH_CHANGED:     'search:changed',
  ROW_CLICKED:        'row:clicked',

  // Route lifecycle
  ROUTE_CHANGING:     'route:changing',
  ROUTE_CHANGED:      'route:changed',

  // Timer
  TIMER_TICK:         'timer:tick',
  TIMER_STARTED:      'timer:started',
  TIMER_STOPPED:      'timer:stopped',

  // Workspace
  TASK_ADDED:         'task:added',
  TASK_TOGGLED:       'task:toggled',
  TASK_DELETED:       'task:deleted',

  // Webhook
  WEBHOOK_TESTED:     'webhook:tested',

  // API Keys
  API_KEY_GENERATED:  'apikey:generated',
  API_KEY_REVOKED:    'apikey:revoked',

  // Calendar
  CALENDAR_CONNECTED: 'calendar:connected',
  CALENDAR_DISCONNECTED: 'calendar:disconnected',
  CALENDAR_SYNCED:    'calendar:synced',

  // Event types
  EVENT_TYPE_CREATED: 'eventtype:created',
  EVENT_TYPE_UPDATED: 'eventtype:updated',
  EVENT_TYPE_DELETED: 'eventtype:deleted',

  // Firestore connectivity
  CONNECTION_CHANGED: 'connection:changed',
})

// ── EventBus ─────────────────────────────────────────────────────

const DEV_MODE = typeof location !== 'undefined' && location.hostname === 'localhost'

function createEventBus() {
  const _channels = new Map()
  let _gen = 0

  function on(channel, handler) {
    if (!_channels.has(channel)) {
      _channels.set(channel, new Map())
    }
    const handlers = _channels.get(channel)
    for (const [key, fn] of handlers) {
      if (fn === handler) return () => handlers.delete(key)
    }
    const key = Symbol('listener')
    handlers.set(key, handler)
    return () => { handlers.delete(key) }
  }

  function onGuarded(channel, handler) {
    const captureGen = _gen
    return on(channel, (data) => {
      if (_gen !== captureGen) return
      handler(data)
    })
  }

  function emit(channel, data) {
    if (DEV_MODE) {
      console.debug('[EventBus]', channel, data)
    }
    const handlers = _channels.get(channel)
    if (!handlers || handlers.size === 0) return
    handlers.forEach(fn => {
      try { fn(data) } catch (e) {
        console.error('[EventBus] handler error on', channel, e)
      }
    })
  }

  function nextGen() {
    _gen++
    if (DEV_MODE) {
      console.debug('[EventBus] generation →', _gen)
    }
  }

  function generation() {
    return _gen
  }

  function reset() {
    _channels.clear()
  }

  return Object.freeze({
    on,
    onGuarded,
    emit,
    nextGen,
    generation,
    reset,
  })
}

export const EventBus = createEventBus()
