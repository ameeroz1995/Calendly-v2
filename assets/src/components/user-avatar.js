/**
 * user-avatar.js — User avatar circle (controller).
 *
 * Usage:
 *   import { createUserAvatar, userAvatar } from './components/user-avatar.js'
 *   const ua = createUserAvatar({ user: { name: 'Amir', photoURL: '...' }, size: 'md' })
 *   parent uses: html`${ua}`  // via toString() → data-cid
 *
 *   // Backward compat (returns toString() directly):
 *   html`${userAvatar({ name: 'Amir' }, 'md')}`
 */

import { controller, html, esc } from '../controller.js'

const SIZES = { sm: 32, md: 40, lg: 64 }

/**
 * Create a user-avatar controller.
 * @param {Object} opts
 * @param {Object} [opts.user] — { name?, email?, photoURL? } or null
 * @param {string} [opts.size='md'] — sm|md|lg
 * @returns {Object} controller
 */
export function createUserAvatar({ user, size = 'md' } = {}) {
  const ctrl = controller({
    template({ state }) {
      const px = SIZES[state.size] || SIZES.md
      const initials = getInitials(state.user)
      const photo = state.user?.photoURL

      if (photo) {
        return html`
          <div id="useravatar-root" style="width:${px}px;height:${px}px;border-radius:50%;background-image:url(${esc(photo)});background-size:cover;background-position:center;flex-shrink:0;" title="${esc(state.user?.name || state.user?.email || '')}"></div>
        `
      }

      return html`
        <div id="useravatar-root" class="sidebar-user-avatar" style="width:${px}px;height:${px}px;font-size:${Math.round(px * 0.38)}px;" title="${esc(state.user?.name || state.user?.email || 'User')}">
          ${esc(initials)}
        </div>
      `
    },
    state: { user: user || null, size },
    methods: {
      setUser(u) { ctrl.render({ user: u }) },
      setSize(s) { ctrl.render({ size: s }) },
    },
  })
  return ctrl
}

/**
 * Backward-compatible shorthand — returns toString() result for inline use.
 * @param {Object} [user] — { name?, email?, photoURL? } or null
 * @param {string} [size='md'] — sm|md|lg
 * @returns {string} HTML placeholder (data-cid)
 */
const _cache = new Map()
export function userAvatar(user, size = 'md') {
  const key = `${user?.uid}|${size}`
  if (!_cache.has(key)) _cache.set(key, createUserAvatar({ user, size }).toString())
  return _cache.get(key)
}

function getInitials(user) {
  if (!user) return '?'
  const name = user.name || user.email || ''
  const parts = String(name).trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
