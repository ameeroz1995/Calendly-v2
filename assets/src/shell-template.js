/**
 * shell-template.js — App chrome template.
 *
 * Renders sidebar, topbar, mobile nav, and content area.
 * Composed from constants/nav.js data. Pure template function — no state ownership.
 *
 * Usage:
 *   import { shellTemplate } from './shell-template.js'
 *   const ctrl = controller({ template: shellTemplate, state: initialState, methods })
 */

import { html, esc } from './controller.js'
import { SIDEBAR_ITEMS, MOBILE_NAV_ITEMS, SHELL_SVG } from './constants/nav.js'

/**
 * Extract initials from a display name.
 */
function getInitials(name) {
  if (!name) return '?'
  const parts = String(name).trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Full app shell template.
 *
 * @param {{ state: Object, fn: Proxy }} ctx
 * @returns {string} HTML string
 */
export function shellTemplate({ state, fn }) {
  const isPublic = state.isPublicRoute

  return html`<div id="app-shell" style="display:flex;min-height:100dvh;max-width:100vw;overflow-x:hidden;">

    ${isPublic ? '' : renderSidebar(state, fn)}
    ${renderMainArea(state, fn, isPublic)}
    ${isPublic ? '' : renderMobileNav(state, fn)}
    ${renderToastContainer()}

  </div>`
}

/** Sidebar: logo, nav items, user footer */
function renderSidebar(state, fn) {
  return html`
    <!-- Sidebar Overlay -->
    <div id="sidebar-overlay"
         class="sidebar-overlay${state.sidebarOpen ? ' show' : ''}"
         onclick="${fn.toggleSidebar}()"></div>

    <aside id="sidebar" class="sidebar${state.sidebarOpen ? ' open' : ''}">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">C</div>
        <span class="sidebar-logo-text">Calendly</span>
      </div>

      <nav class="sidebar-nav">
        ${SIDEBAR_ITEMS.map(item => html`
          <a class="sidebar-nav-item${state.route === item.route ? ' active' : ''}"
             href="#${item.route}"
             data-route="${item.route}"
             onclick="${fn.navigateTo}('${item.route}')"
             style="${item.accent ? 'color:#7047EB;' : ''}">
            ${SHELL_SVG[item.icon] || ''}
            ${esc(item.label)}
          </a>
        `).join('')}
      </nav>

      <div class="sidebar-user">
        <div class="sidebar-user-avatar">${state.user ? esc(getInitials(state.user.displayName || state.user.email || '?')) : '?'}</div>
        <div>
          <div class="sidebar-user-name">${state.user ? esc(state.user.displayName || state.user.email || 'Not signed in') : 'Not signed in'}</div>
          <div class="sidebar-user-role">Administrator</div>
        </div>
      </div>
    </aside>
  `
}

/** Main area: topbar + content */
function renderMainArea(state, fn, isPublic) {
  return html`
    <main id="main-area" class="main-area" style="${isPublic ? 'margin-left:0;' : ''}">
      ${isPublic ? '' : renderTopbar(state, fn)}
      <div id="app-content" class="main-content${isPublic ? ' public' : ''}"
           style="${isPublic ? 'padding-top:40px;max-width:100%;' : ''}">
        ${state.contentHtml || ''}
      </div>
    </main>
  `
}

/** Topbar: hamburger, page title, sign out */
function renderTopbar(state, fn) {
  return html`
    <div class="main-topbar">
      <div style="display:flex;align-items:center;gap:12px;">
        <button class="hamburger-btn" onclick="${fn.toggleSidebar}()" aria-label="Toggle menu">
          ${SHELL_SVG.hamburger}
        </button>
        <div class="main-topbar-title">${esc(state.pageTitle)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        ${state.user ? html`
          <button class="btn btn-primary btn-sm" onclick="${fn.signOut}()">Sign Out</button>
        ` : ''}
      </div>
    </div>
  `
}

/** Mobile bottom navigation bar */
function renderMobileNav(state, fn) {
  return html`
    <nav id="mobile-nav" class="mobile-nav">
      ${MOBILE_NAV_ITEMS.map(item => html`
        <a class="mobile-nav-item${state.route === item.route ? ' active' : ''}"
           href="#${item.route}"
           onclick="${fn.navigateTo}('${item.route}')">
          ${SHELL_SVG[item.icon] || ''}
          ${esc(item.label)}
        </a>
      `).join('')}
    </nav>
  `
}

/** Toast notification container (always present) */
function renderToastContainer() {
  return html`<div class="toast-container" id="toast-container"></div>`
}
