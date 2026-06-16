/**
 * workspace-detail.js — Single workspace detail (3-column).
 * Tasks | Timer | Messages
 */

import { icon } from '../utils/icons.js'
import { controller, html, esc } from '../controller.js'
import { badge } from '../components/badge.js'
import { dbRef, dbRead, dbUpdate, dbRemove } from '../db.js'

export function workspaceDetailView({ state, fn }) {
  if (state.error && !state.loading) {
    return html`<div class="card" style="text-align:center;padding:48px;"><div style="color:#FF4A5A;margin-bottom:12px;">${icon.alert}</div><div class="card-header" style="color:#FF4A5A;">Error loading workspace</div><div style="color:#8A8993;margin-bottom:16px;">${esc(state.error)}</div><button class="btn btn-primary" onclick="${fn.retryRoute}()">Try Again</button></div>`
  }
  if (state.loading) {
    return html`<div style="text-align:center;padding:48px;color:#8A8993;">Loading workspace...</div>`
  }

  if (state.workspaceError === 'forbidden') {
    return html`<div class="empty-state"><div style="font-size:48px;margin-bottom:16px;">${icon.lock}</div><div class="empty-state-title">Access Denied</div><div class="empty-state-desc">You don't have access to this workspace.</div></div>`
  }

  const ws = state.activeWorkspace || {}
  const tasks = Object.values(ws.tasks || {}).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
  const messages = Object.values(ws.messages || {}).sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
  const timerRunning = (ws.timers?.current?.running)
  const timerPaused = timerRunning && (ws.timers?.current?.paused === true)
  const timerMode = ws.timers?.current?.mode || 'session'
  const timerElapsed = timerRunning ? formatElapsed(Date.now() - (ws.timers.current.startTime || 0)) : '00:00:00'

  return html`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <button class="btn btn-ghost btn-sm" onclick="${fn.navigateTo}('/workspaces')">← Back</button>
      <h2>${esc(ws.clientName || 'Guest')} — ${esc(ws.eventTypeId || 'Meeting')}</h2>
      ${badge(ws.status === 'active' ? 'success' : 'warning', ws.status || 'Active')}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
      <!-- Tasks -->
      <div class="card">
        <div class="card-header">Tasks</div>
        <div style="display:flex;flex-direction:column;gap:8px;min-height:120px;">
          ${tasks.map(t => html`
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.875rem;">
              <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="${fn.toggleTask}('${esc(t.tid)}', !${t.completed})" style="accent-color:#7047EB;">
              <span style="${t.completed ? 'text-decoration:line-through;color:#8A8993;' : ''}">${esc(t.title)}</span>
              <button class="btn btn-ghost btn-sm" onclick="${fn.deleteTask}('${esc(t.tid)}')" style="margin-left:auto;min-height:28px;padding:2px 6px;font-size:0.75rem;color:#FF4A5A;">${icon.trash}</button>
            </label>
          `).join('')}
          ${tasks.length === 0 ? html`<div style="text-align:center;color:#8A8993;padding:16px;font-size:0.875rem;">No tasks yet</div>` : ''}
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <input id="ws-task-input" class="input" placeholder="Add task..." style="font-size:0.875rem;" onkeydown="${fn._taskKeydown}()">
          <button class="btn btn-primary btn-sm" onclick="${fn.addTask}()">Add</button>
        </div>
      </div>

      <!-- Timer -->
      <div class="card">
        <div class="card-header">Timer</div>
        <div style="text-align:center;padding:16px;">
          <div style="font-family:'Geist',sans-serif;font-weight:700;font-size:2.5rem;font-variant-numeric:tabular-nums;">${esc(timerElapsed)}</div>
          <div style="font-size:0.875rem;color:#8A8993;margin-bottom:4px;">
            ${timerPaused ? esc(timerMode) + ' · Paused' : timerRunning ? esc(timerMode) + ' · Running' : 'Stopped'}
          </div>
          ${timerRunning && !timerPaused && (Date.now() - ws.timers.current.startTime) > 7 * 3600000 ? html`<div style="color:#F5A623;font-size:0.75rem;margin-bottom:8px;">${icon.alert} Approaching 8h limit</div>` : ''}
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
            ${timerRunning ? html`
              ${!timerPaused ? html`<button class="btn btn-ghost btn-sm" onclick="${fn.pauseTimer}()" style="color:#F5A623;">Pause</button>` : ''}
              ${timerPaused ? html`<button class="btn btn-primary btn-sm" onclick="${fn.resumeTimer}()">Resume</button>` : ''}
              <button class="btn btn-ghost btn-sm" onclick="${fn.stopTimer}()" style="color:#FF4A5A;">Stop</button>
            ` : html`
              <button class="btn btn-primary btn-sm" onclick="${fn.startTimer}('prep')">Prep</button>
              <button class="btn btn-primary btn-sm" onclick="${fn.startTimer}('session')">Session</button>
              <button class="btn btn-primary btn-sm" onclick="${fn.startTimer}('followup')">Follow-up</button>
            `}
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="card">
        <div class="card-header">Messages</div>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:240px;overflow-y:auto;min-height:120px;">
          ${messages.map(m => {
            const isHost = m.senderId === (ws.hostId || state.user?.uid)
            return html`
              <div style="background:${isHost ? '#1A1923' : 'rgba(112,71,235,0.08)'};padding:8px;border-radius:8px;font-size:0.875rem;">
                <strong>${isHost ? 'You' : esc(ws.clientName || 'Guest')}:</strong> ${esc(m.text)}
              </div>
            `
          }).join('')}
          ${messages.length === 0 ? html`<div style="text-align:center;color:#8A8993;padding:16px;font-size:0.875rem;">No messages yet</div>` : ''}
        </div>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <input id="ws-msg-input" class="input" placeholder="Type message..." style="font-size:0.875rem;">
          <button class="btn btn-primary btn-sm" onclick="${fn.sendMessage}()">Send</button>
        </div>
      </div>
    </div>
  `
}

function formatElapsed(ms) {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return [h, m, s].map(x => String(x).padStart(2, '0')).join(':')
}
export function createWorkspaceDetail({ router, eventBus } = {}) {
  const ctrl = controller({
    template({ state, fn }) { return workspaceDetailView({ state, fn }) },
    state: {
      activeWorkspace: {},
      error: '',
      loading: true,
      user: null,
      workspaceError: ''
    },
    methods: {
      _taskKeydown() {
        if (event && event.key === 'Enter') {
          ctrl.addTask()
        }
      },
      addTask() {
        const input = ctrl.$('ws-task-input')
        if (!input) return
        const title = input.value.trim()
        if (!title) return
        input.value = ''

        const ws = { ...ctrl.getState().activeWorkspace }
        const tasks = { ...(ws.tasks || {}) }
        const tid = 'tsk_' + Math.random().toString(36).slice(2, 8)
        const now = new Date().toISOString()
        tasks[tid] = { tid, title, completed: false, createdAt: now }
        ws.tasks = tasks
        ws.updatedAt = now
        ctrl.render({ activeWorkspace: ws })
        _persist(ws)
      },
      deleteTask(tid) {
        const ws = { ...ctrl.getState().activeWorkspace }
        const tasks = { ...(ws.tasks || {}) }
        delete tasks[tid]
        ws.tasks = tasks
        ws.updatedAt = new Date().toISOString()
        ctrl.render({ activeWorkspace: ws })
        _persist(ws)
      },
      toggleTask(tid) {
        const ws = { ...ctrl.getState().activeWorkspace }
        const tasks = { ...(ws.tasks || {}) }
        if (tasks[tid]) {
          tasks[tid] = { ...tasks[tid], completed: !tasks[tid].completed }
        }
        ws.tasks = tasks
        ws.updatedAt = new Date().toISOString()
        ctrl.render({ activeWorkspace: ws })
        _persist(ws)
      },
      startTimer(mode) {
        const ws = { ...ctrl.getState().activeWorkspace }
        ws.timers = {
          ...(ws.timers || {}),
          current: { mode, startTime: Date.now(), running: true },
        }
        ws.updatedAt = new Date().toISOString()
        ctrl.render({ activeWorkspace: ws })
        _persist(ws)
      },
      pauseTimer() {
        const ws = { ...ctrl.getState().activeWorkspace }
        const current = ws.timers?.current
        if (current) {
          ws.timers = { ...ws.timers, current: { ...current, paused: true } }
        }
        ctrl.render({ activeWorkspace: ws })
        _persist(ws)
      },
      resumeTimer() {
        const ws = { ...ctrl.getState().activeWorkspace }
        const current = ws.timers?.current
        if (current) {
          ws.timers = { ...ws.timers, current: { ...current, paused: false } }
        }
        ctrl.render({ activeWorkspace: ws })
        _persist(ws)
      },
      stopTimer() {
        const ws = { ...ctrl.getState().activeWorkspace }
        const current = ws.timers?.current
        if (current && current.running) {
          const now = Date.now()
          const elapsedMs = now - (current.startTime || now)
          const elapsedMin = Math.round(elapsedMs / 60000)
          const lid = 'tml_' + Math.random().toString(36).slice(2, 8)
          const log = { ...(ws.timers?.log || {}) }
          log[lid] = {
            lid,
            mode: current.mode || 'session',
            startTime: current.startTime,
            endTime: now,
            elapsedMin,
          }
          ws.timers = { ...ws.timers, current: { running: false, stoppedAt: now }, log }
          ws.updatedAt = new Date().toISOString()
        }
        ctrl.render({ activeWorkspace: ws })
        _persist(ws)
      },
      sendMessage() {
        const input = ctrl.$('ws-msg-input')
        if (!input) return
        const text = input.value.trim()
        if (!text) return
        input.value = ''

        const state = ctrl.getState()
        const ws = { ...state.activeWorkspace }
        const messages = { ...(ws.messages || {}) }
        const mid = 'msg_' + Math.random().toString(36).slice(2, 8)
        const now = new Date().toISOString()
        messages[mid] = {
          mid,
          senderId: state.user?.uid || 'anonymous',
          text,
          createdAt: now,
        }
        ws.messages = messages
        ws.updatedAt = now
        ctrl.render({ activeWorkspace: ws })
        _persist(ws)
      },
    },
  })

  function _persist(ws) {
    const wid = ws.wid
    if (!wid) return
    dbUpdate(dbRef(`/workspaces/${wid}`), {
      tasks: ws.tasks || {},
      messages: ws.messages || {},
      timers: ws.timers || {},
      updatedAt: ws.updatedAt || new Date().toISOString(),
    }).unwrap().catch(e => console.error('[workspace-detail] persist error:', e))
  }

  ctrl.load = async function () {
    const state = ctrl.getState()
    const wid = state.currentParams?.id || state.activeWorkspace?.wid
    if (!wid) {
      ctrl.render({ loading: true })
      return
    }
    try {
      const [ws, err] = await dbRead(dbRef(`/workspaces/${wid}`)).unwrap()
      if (err) throw err
      if (!ws) {
        ctrl.render({ loading: true, workspaceError: 'forbidden' })
        return
      }
      ctrl.render({ activeWorkspace: ws, loading: true, error: '', workspaceError: '' })
    } catch (e) {
      console.error('[workspace-detail] load error:', e)
      ctrl.render({ loading: true, error: e.message || 'Failed to load workspace' })
    }
  }

  return ctrl
}
