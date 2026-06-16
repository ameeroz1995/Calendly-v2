/**
 * data-table.js — Sortable data table (stateful).
 *
 * Usage:
 *   import { DataTable } from './components/data-table.js'
 *   const dt = DataTable()
 *   dt.setColumns([{ key:'name', label:'Name', sortable:true }])
 *   dt.setData([{ name:'Amir', ... }])
 *   dt.onRowClick((row) => { ... })
 *   parent uses: html`${dt}`
 */

import { controller, html, esc } from '../controller.js'
import { EventBus, MSG } from '../messages/catalog.js'

export function createDataTable() {
  let _columns = []
  let _data = []
  let _sortKey = null
  let _sortDir = 'asc'
  let _onRowClick = null

  function sortedData() {
    if (!_sortKey) return _data
    return [..._data].sort((a, b) => {
      const va = a[_sortKey] ?? ''
      const vb = b[_sortKey] ?? ''
      const cmp = typeof va === 'string' ? va.localeCompare(String(vb)) : va - vb
      return _sortDir === 'desc' ? -cmp : cmp
    })
  }

  const ctrl = controller({
    template({ state, fn }) {
      const rows = sortedData()
      return html`
        <div id="datatable-root" class="table-wrap">
          <table class="data-table">
            <thead><tr>
              ${_columns.map(col => html`
                <th onclick="${col.sortable !== false ? fn._sort + '' : ''}${col.sortable !== false ? "('" + col.key + "')" : ''}"
                    style="${col.sortable !== false ? 'cursor:pointer;' : ''}">
                  ${esc(col.label)}
                  ${_sortKey === col.key ? html`<span style="margin-left:4px;">${_sortDir === 'asc' ? '↑' : '↓'}</span>` : ''}
                </th>
              `).join('')}
            </tr></thead>
            <tbody>
              ${rows.length === 0 ? html`<tr><td colspan="${_columns.length}" style="text-align:center;color:#8A8993;">No data</td></tr>` : ''}
              ${rows.map((row, i) => html`
                <tr onclick="${fn._rowClick}(${i})" style="${_onRowClick ? 'cursor:pointer;' : ''}">
                  ${_columns.map(col => html`<td>${esc(String(row[col.key] ?? ''))}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    },
    state: {},
    methods: {
      _sort(key) {
        if (_sortKey === key) {
          _sortDir = _sortDir === 'asc' ? 'desc' : 'asc'
        } else {
          _sortKey = key
          _sortDir = 'asc'
        }
        ctrl.render({})
      },
      _rowClick(idx) {
        EventBus.emit(MSG.ROW_CLICKED, { row: _data[idx], index: idx })
        if (typeof _onRowClick === 'function') {
          try { _onRowClick(_data[idx], idx) } catch (e) { console.error('[data-table] onRowClick error:', e) }
        }
      },
    },
  })

  ctrl.setColumns = (cols) => { _columns = cols; ctrl.render({}) }
  ctrl.setData = (rows) => { _data = rows || []; ctrl.render({}) }
  ctrl.onRowClick = (fn) => { _onRowClick = fn }

  return ctrl
}

/** @deprecated Use createDataTable() instead */
export const DataTable = createDataTable
