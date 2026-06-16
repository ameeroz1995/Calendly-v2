/**
 * constants/app.js — Application initial state and app-wide configuration.
 * Pure data, zero dependencies.
 */

/** Initial controller state for the main app shell.
 *  Only chrome state: route, user, sidebar. Views own their own state. */
export const INITIAL_STATE = {
  route: '/',
  currentParams: {},
  currentQuery: {},
  user: null,
  authLoading: true,
  sidebarOpen: false,
  isPublicRoute: false,
  pageTitle: 'Calendly',
  loading: false,
  error: null,
  _viewCtrl: null,
}

/** Route guard: public routes allowed without authentication */
export const PUBLIC_ROUTES = ['/login']

/** Public route prefix — any route starting with this bypasses auth guard */
export const PUBLIC_PREFIX = '/book/'

/** Default route after sign-in */
export const DEFAULT_ROUTE = '/'

/** Login route */
export const LOGIN_ROUTE = '/login'

/** EventBus debug mode — set false in production */
export const EVENTBUS_DEBUG = true
