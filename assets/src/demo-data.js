/**
 * demo-data.js — Demo data for offline/Firebase-disconnected mode.
 *
 * Provides realistic sample data so the app is functional without Firebase.
 * Used by route loaders when Firebase init fails or is unconfigured.
 */

export const DEMO_USER = {
  uid: 'demo-user-001',
  displayName: 'Amir Zaidan',
  email: 'amir@company.com',
  photoURL: null,
  plan: 'free',
  timezone: 'Asia/Riyadh',
  createdAt: '2026-01-15T08:00:00Z',
  updatedAt: '2026-06-16T10:00:00Z',
}

export const DEMO_EVENT_TYPES = [
  {
    eid: 'evt_demo_001', title: 'Strategy Call', description: 'A focused strategy session to align on goals and roadmap.',
    duration: 45, location: 'zoom', color: '#7047EB', requiresPhi: false, visibility: 'public', active: true,
    bookingRules: {}, formFields: [
      { id: 'name', label: 'Your Name', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true },
    ],
    createdAt: '2026-03-01T08:00:00Z', updatedAt: '2026-06-15T10:00:00Z',
  },
  {
    eid: 'evt_demo_002', title: 'Quick Chat', description: 'A quick 15-minute catch-up.',
    duration: 15, location: 'meet', color: '#00C48C', requiresPhi: false, visibility: 'public', active: true,
    bookingRules: {}, formFields: [
      { id: 'name', label: 'Your Name', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true },
    ],
    createdAt: '2026-04-10T08:00:00Z', updatedAt: '2026-06-10T14:00:00Z',
  },
  {
    eid: 'evt_demo_003', title: 'Demo Session', description: 'Full product demonstration.',
    duration: 60, location: 'zoom', color: '#F5A623', requiresPhi: false, visibility: 'public', active: true,
    bookingRules: {}, formFields: [
      { id: 'name', label: 'Your Name', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true },
      { id: 'company', label: 'Company', type: 'text', required: false },
    ],
    createdAt: '2026-05-01T08:00:00Z', updatedAt: '2026-06-12T09:00:00Z',
  },
  {
    eid: 'evt_demo_004', title: 'Consultation', description: 'In-depth consultation session.',
    duration: 30, location: 'none', color: '#FF4A5A', requiresPhi: true, visibility: 'public', active: false,
    bookingRules: {}, formFields: [
      { id: 'name', label: 'Your Name', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true },
      { id: 'notes', label: 'Notes', type: 'textarea', required: false },
    ],
    createdAt: '2026-02-20T08:00:00Z', updatedAt: '2026-05-01T08:00:00Z',
  },
]

export const DEMO_CALENDAR_CONNECTIONS = [
  { cid: 'cal_demo_001', provider: 'google', email: 'amir@company.com', status: 'active', lastSync: new Date(Date.now() - 120000).toISOString(), createdAt: '2026-03-01T08:00:00Z' },
  { cid: 'cal_demo_002', provider: 'microsoft', email: 'amir@outlook.com', status: 'active', lastSync: new Date(Date.now() - 2700000).toISOString(), createdAt: '2026-04-15T10:00:00Z' },
]

export const DEMO_WORKING_HOURS = {
  mon: { start: '09:00', end: '17:00', enabled: true },
  tue: { start: '09:00', end: '17:00', enabled: true },
  wed: { start: '09:00', end: '17:00', enabled: true },
  thu: { start: '09:00', end: '17:00', enabled: true },
  fri: { start: '09:00', end: '14:00', enabled: true },
  sat: { start: '10:00', end: '14:00', enabled: true },
  sun: { enabled: false },
}

export const DEMO_BOOKING_RULES = {
  maxPerDay: 3, minNoticeHours: 2, maxAdvanceDays: 60, bufferMinutes: 15,
}

export function generateDemoSlots() {
  const slots = []
  const now = new Date()
  for (let d = 0; d < 14; d++) {
    const date = new Date(now)
    date.setUTCDate(date.getUTCDate() + d)
    date.setUTCHours(0, 0, 0, 0)
    const iso = date.toISOString().slice(0, 10)
    const dayOfWeek = date.getUTCDay()
    if (dayOfWeek === 0) continue // skip Sundays
    const startHour = dayOfWeek === 6 ? 10 : 9
    const endHour = dayOfWeek === 6 ? 14 : 17
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += 45) {
        const start = new Date(date)
        start.setUTCHours(h, m, 0, 0)
        const sid = 'slt_' + start.toISOString().replace(/[^0-9]/g, '').slice(0, 14)
        const status = (d === 0 && h === startHour && m === 0) ? 'busy' : 'free'
        slots.push({ sid, date: iso, start: start.toISOString(), end: new Date(start.getTime() + 45 * 60000).toISOString(), time: start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), status })
      }
    }
  }
  return slots
}

export function generateDemoMonthGrid() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const grid = []
  const firstDay = new Date(Date.UTC(year, month, 1))
  const lastDay = new Date(Date.UTC(year, month + 1, 0))
  const startDow = firstDay.getUTCDay()
  const today = now.toISOString().slice(0, 10)

  let day = 1
  for (let row = 0; row < 6; row++) {
    const week = []
    for (let col = 0; col < 7; col++) {
      if ((row === 0 && col < startDow) || day > lastDay.getUTCDate()) {
        week.push(null)
      } else {
        const dt = new Date(Date.UTC(year, month, day))
        const iso = dt.toISOString().slice(0, 10)
        const dow = dt.getUTCDay()
        week.push({
          day: day,
          hasSlots: dow !== 0,
          isToday: iso === today,
        })
        day++
      }
    }
    grid.push(week)
  }
  return grid
}

export const DEMO_BOOKINGS = [
  { bid: 'bkg_demo_001', hostId: 'demo-user-001', inviteeId: 'guest-001', eventTypeId: 'Strategy Call', date: '2026-06-16', slotId: 'slt_001', status: 'confirmed', formData: { name: 'Sarah Chen', email: 'sarah@example.com' }, createdAt: '2026-06-15T10:30:00Z' },
  { bid: 'bkg_demo_002', hostId: 'demo-user-001', inviteeId: 'guest-002', eventTypeId: 'Demo Session', date: '2026-06-16', slotId: 'slt_002', status: 'confirmed', formData: { name: 'Marcus Rivera', email: 'marcus@example.com' }, createdAt: '2026-06-15T14:00:00Z' },
  { bid: 'bkg_demo_003', hostId: 'demo-user-001', inviteeId: 'guest-003', eventTypeId: 'Quick Chat', date: '2026-06-17', slotId: 'slt_003', status: 'pending', formData: { name: 'Emily Park', email: 'emily@example.com' }, createdAt: '2026-06-16T09:00:00Z' },
  { bid: 'bkg_demo_004', hostId: 'demo-user-001', inviteeId: 'guest-004', eventTypeId: 'Strategy Call', date: '2026-06-14', slotId: 'slt_004', status: 'cancelled', formData: { name: 'David Kim', email: 'david@example.com' }, createdAt: '2026-06-13T16:00:00Z' },
  { bid: 'bkg_demo_005', hostId: 'demo-user-001', inviteeId: 'guest-005', eventTypeId: 'Quick Chat', date: '2026-06-17', slotId: 'slt_005', status: 'confirmed', formData: { name: 'Lisa Thompson', email: 'lisa@example.com' }, createdAt: '2026-06-16T11:30:00Z' },
]

export const DEMO_WORKSPACES = [
  { wid: 'ws_demo_001', hostId: 'demo-user-001', clientId: 'guest-001', clientName: 'Sarah Chen', eventTypeId: 'Strategy Call', bookingId: 'bkg_demo_001', status: 'active', tasks: { tsk_1: { tid: 'tsk_1', title: 'Send proposal deck', completed: true, createdAt: '2026-06-15T10:00:00Z' }, tsk_2: { tid: 'tsk_2', title: 'Follow up on pricing', completed: false, createdAt: '2026-06-15T11:00:00Z' }, tsk_3: { tid: 'tsk_3', title: 'Schedule technical review', completed: false, createdAt: '2026-06-16T08:00:00Z' } }, messages: { msg_1: { mid: 'msg_1', senderId: 'demo-user-001', text: 'Looking forward to our session!', createdAt: '2026-06-15T09:00:00Z' }, msg_2: { mid: 'msg_2', senderId: 'guest-001', text: 'Thanks! I\'ll have the requirements ready.', createdAt: '2026-06-15T09:30:00Z' } }, timers: { current: { mode: 'session', startTime: Date.now() - 5025000, running: true }, log: { tml_1: { lid: 'tml_1', mode: 'prep', startTime: Date.now() - 7200000, endTime: Date.now() - 5400000, elapsedMin: 30 } } }, createdAt: '2026-06-15T08:00:00Z', updatedAt: '2026-06-16T10:00:00Z' },
  { wid: 'ws_demo_002', hostId: 'demo-user-001', clientId: 'guest-002', clientName: 'Marcus Rivera', eventTypeId: 'Demo Session', bookingId: 'bkg_demo_002', status: 'active', tasks: {}, messages: {}, timers: { current: null, log: {} }, createdAt: '2026-06-15T14:00:00Z', updatedAt: '2026-06-15T14:00:00Z' },
  { wid: 'ws_demo_003', hostId: 'demo-user-001', clientId: 'guest-003', clientName: 'Emily Park', eventTypeId: 'Quick Chat', bookingId: 'bkg_demo_003', status: 'active', tasks: {}, messages: {}, timers: { current: null, log: {} }, createdAt: '2026-06-16T09:00:00Z', updatedAt: '2026-06-16T09:00:00Z' },
]

export const DEMO_ROUTING_FORMS = [
  { fid: 'rf_demo_001', uid: 'demo-user-001', name: 'Sales Qualification', questions: [{ id: 'q1', label: 'What is your budget?', type: 'select', options: [{ value: 'under_10k', label: 'Under $10K' }, { value: '10k_50k', label: '$10K-$50K' }, { value: 'over_50k', label: 'Over $50K' }] }], rules: [{ questionId: 'q1', answer: 'over_50k', poolId: 'pl_demo_001' }], active: true, createdAt: '2026-05-01T08:00:00Z' },
  { fid: 'rf_demo_002', uid: 'demo-user-001', name: 'Support Intake', questions: [{ id: 'q1', label: 'Issue severity', type: 'select', options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }] }], rules: [{ questionId: 'q1', answer: 'high', poolId: 'pl_demo_002' }], active: true, createdAt: '2026-04-20T08:00:00Z' },
]

export const DEMO_POOLS = [
  { pid: 'pl_demo_001', uid: 'demo-user-001', name: 'Sales Pool', strategy: 'round_robin', members: [{ uid: 'user-001', name: 'Alex K.', priority: 1 }, { uid: 'user-002', name: 'Maria S.', priority: 2 }, { uid: 'user-003', name: 'James T.', priority: 3 }], active: true },
  { pid: 'pl_demo_002', uid: 'demo-user-001', name: 'Support Pool', strategy: 'collective', members: [{ uid: 'user-004', name: 'Linda C.', priority: 1 }, { uid: 'user-005', name: 'Tom H.', priority: 2 }], active: true },
]

export const DEMO_WEBHOOKS = [
  { sid: 'wh_demo_001', url: 'https://api.crm.example.com/webhooks/calendly', events: ['invitee.created', 'invitee.canceled'], active: true, lastDelivery: new Date(Date.now() - 3600000).toISOString(), deliveryCount: 47 },
  { sid: 'wh_demo_002', url: 'https://hooks.slack.com/services/T.../B.../xxxx', events: ['invitee.created'], active: true, lastDelivery: new Date(Date.now() - 7200000).toISOString(), deliveryCount: 23 },
]

export const DEMO_API_KEYS = [
  { kid: 'key_demo_001', name: 'Production Key', prefix: 'cal_live_', hash: '...', salt: '...', scopes: ['read:bookings', 'write:bookings'], active: true, createdAt: '2026-06-02T08:00:00Z', lastUsed: new Date(Date.now() - 7200000).toISOString() },
  { kid: 'key_demo_002', name: 'Development Key', prefix: 'cal_dev_', hash: '...', salt: '...', scopes: ['read:bookings'], active: true, createdAt: '2026-05-28T08:00:00Z', lastUsed: new Date(Date.now() - 86400000).toISOString() },
]

export const DEMO_RESOURCES = [
  { rid: 'res_demo_001', name: 'Conference Room A', type: 'room', capacity: 8, location: 'Floor 3', active: true, createdAt: '2026-05-01T08:00:00Z' },
  { rid: 'res_demo_002', name: 'Projector Kit', type: 'equipment', capacity: null, location: 'IT Storage', active: true, createdAt: '2026-05-10T08:00:00Z' },
  { rid: 'res_demo_003', name: 'Board Room', type: 'room', capacity: 16, location: 'Floor 4', active: true, createdAt: '2026-04-15T08:00:00Z' },
]

export const DEMO_CONTACTS = [
  { cid: 'ctc_demo_001', name: 'Sarah Chen', email: 'sarah@example.com', company: 'Acme Corp', totalBookings: 12, noShowCount: 0, lastBooking: '2026-06-16T10:00:00Z', lists: ['VIP'], createdAt: '2026-01-10T08:00:00Z' },
  { cid: 'ctc_demo_002', name: 'Marcus Rivera', email: 'marcus@example.com', company: 'TechStart Inc', totalBookings: 5, noShowCount: 1, lastBooking: '2026-06-15T14:00:00Z', lists: [], createdAt: '2026-03-15T08:00:00Z' },
  { cid: 'ctc_demo_003', name: 'Emily Park', email: 'emily@example.com', company: 'DesignLab', totalBookings: 3, noShowCount: 0, lastBooking: '2026-06-16T09:00:00Z', lists: ['Enterprise'], createdAt: '2026-05-01T08:00:00Z' },
]

export const DEMO_AUDIT_ENTRIES = [
  { entryId: 'audit_001', action: 'auth.signed_in', userId: 'demo-user-001', timestamp: Date.now() - 60000, iso: new Date(Date.now() - 60000).toISOString(), target: null },
  { entryId: 'audit_002', action: 'booking.created', userId: 'demo-user-001', timestamp: Date.now() - 3600000, iso: new Date(Date.now() - 3600000).toISOString(), target: 'bkg_demo_003' },
  { entryId: 'audit_003', action: 'event_type.updated', userId: 'demo-user-001', timestamp: Date.now() - 7200000, iso: new Date(Date.now() - 7200000).toISOString(), target: 'evt_demo_001', oldValue: '{"duration":30}', newValue: '{"duration":45}' },
  { entryId: 'audit_004', action: 'api_key.generated', userId: 'demo-user-001', timestamp: Date.now() - 86400000, iso: new Date(Date.now() - 86400000).toISOString(), target: 'key_demo_002' },
  { entryId: 'audit_005', action: 'webhook.subscribed', userId: 'demo-user-001', timestamp: Date.now() - 172800000, iso: new Date(Date.now() - 172800000).toISOString(), target: 'wh_demo_001' },
]

/** Whether Firebase is available (checked at boot) */
export let isDemoMode = false

export function setDemoMode(v) { isDemoMode = v }
