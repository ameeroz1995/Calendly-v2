/**
 * constants/nav.js — Navigation items, page titles, and shell SVG icons.
 * Pure data, zero dependencies.
 */

export const SIDEBAR_ITEMS = [
  { route: '/',              icon: 'dashboard',  label: 'Dashboard' },
  { route: '/calendar',      icon: 'calendar',   label: 'Calendar' },
  { route: '/event-types',   icon: 'clock',      label: 'Event Types' },
  { route: '/availability',  icon: 'calendar',   label: 'Availability' },
  { route: '/routing-forms', icon: 'check',      label: 'Routing' },
  { route: '/pools',         icon: 'users',      label: 'Pools' },
  { route: '/workspaces',    icon: 'copy',       label: 'Workspaces' },
  { route: '/resources',     icon: 'copy',       label: 'Resources' },
  { route: '/contacts',      icon: 'users',      label: 'Contacts' },
  { route: '/time-tracking', icon: 'chart',      label: 'Time Tracking' },
  { route: '/audit-log',     icon: 'shield',     label: 'Audit Log' },
  { route: '/compliance',    icon: 'shield',     label: 'Compliance' },
  { route: '/webhooks',      icon: 'webhook',    label: 'Webhooks' },
  { route: '/api-keys',      icon: 'key',        label: 'API Keys' },
  { route: '/event-types/editor', icon: 'edit',  label: 'Page Editor', accent: true },
  { route: '/settings',      icon: 'settings',   label: 'Settings' },
]

export const MOBILE_NAV_ITEMS = [
  { route: '/',              icon: 'dashboard',  label: 'Home' },
  { route: '/calendar',      icon: 'calendar',   label: 'Calendar' },
  { route: '/event-types',   icon: 'clock',      label: 'Events' },
  { route: '/workspaces',    icon: 'copy',       label: 'Workspaces' },
  { route: '/settings',      icon: 'settings',   label: 'Settings' },
]

export const PAGE_TITLES = {
  '/':                        'Dashboard',
  '/login':                   'Sign In',
  '/calendar':                'Calendar Connections',
  '/event-types':             'Event Types',
  '/event-types/editor':      'Booking Page Editor',
  '/availability':            'Availability',
  '/book/:hostId/:eventTypeId': 'Book a Meeting',
  '/book/otl/:token':         'Book a Meeting',
  '/routing-forms':           'Routing Forms',
  '/pools':                   'Routing Pools',
  '/workspaces':              'Workspaces',
  '/workspaces/:id':          'Workspace',
  '/resources':               'Resources',
  '/contacts':                'Contacts',
  '/contacts/:id':            'Contact',
  '/time-tracking':           'Time Tracking',
  '/audit-log':               'Audit Log',
  '/compliance':              'Compliance',
  '/webhooks':                'Webhooks',
  '/api-keys':                'API Keys',
  '/settings':                'Settings',
}

/** Minimal inline SVG strings for shell chrome (not the full icons.js set) */
export const SHELL_SVG = {
  dashboard: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  clock: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
  users: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M5.5 20v-1a5.5 5.5 0 0110.7-2"/><path d="M18.5 20v-1a5.5 5.5 0 00-2.2-4.5"/></svg>',
  copy: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>',
  chart: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  shield: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  webhook: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 012 17c.01-.7.2-1.4.57-2"/><path d="M6 7.02h6.03c1.12 0 2-.88 2.46-1.84A4 4 0 0122 7c-.01.7-.2 1.4-.57 2"/><path d="M12 2v4M12 18v4"/></svg>',
  key: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L16 7l3 3-5.3 5.3"/><path d="M21 2l-3.5 3.5M21 2h-6M21 2v6"/></svg>',
  edit: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  settings: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
  hamburger: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>',
}
