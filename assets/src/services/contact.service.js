/**
 * contact.service.js — Contacts/CRM service.
 *
 * Contact profiles with notes, custom fields, lists, and booking history.
 * RTDB: /contacts/{uid}/{cid}
 * Views: /contacts, /contacts/:id
 */

import { AsyncResult } from '../utils/Result.js'
import { dbRef, dbRead, dbWrite, dbUpdate, dbRemove } from '../firebase.js'
import { generateRandomHex } from '../utils/crypto.js'

/**
 * Create a contact.
 *
 * @param {string} ownerId — host UID who owns this contact
 * @param {Object} data — { name, email?, phone?, company?, notes?, customFields? }
 * @returns {AsyncResult}
 */
export function createContact(ownerId, data) {
  return AsyncResult.from((async () => {
    const cid = 'ctc_' + generateRandomHex(8)
    const now = new Date().toISOString()

    // Normalize name
    const name = (data.name || data.email || 'Unknown').normalize('NFC')

    await dbWrite(dbRef(`/contacts/${ownerId}/${cid}`), {
      cid,
      ownerId,
      name,
      email: data.email || '',
      phone: data.phone || '',
      company: data.company || '',
      notes: data.notes || '',
      customFields: data.customFields || {},
      totalBookings: 0,
      noShowCount: 0,
      lastBooking: null,
      createdAt: now,
      updatedAt: now,
    }).unwrapOrThrow()
    return cid
  })())
}

/**
 * Get a contact by ID.
 * @param {string} ownerId
 * @param {string} cid
 * @returns {AsyncResult}
 */
export function getContact(ownerId, cid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/contacts/${ownerId}/${cid}`)).unwrap()
    if (err) throw err
    if (!data) throw new Error('Contact not found')
    return data
  })())
}

/**
 * List contacts with optional search + filters.
 *
 * @param {string} ownerId
 * @param {Object} filters — { search?, sortBy?, sortDir?, limit? }
 * @returns {AsyncResult}
 */
export function listContacts(ownerId, filters = {}) {
  return AsyncResult.from((async () => {
    const [all, err] = await dbRead(dbRef(`/contacts/${ownerId}`)).unwrap()
    if (err) throw err
    if (!all) return []

    let results = Object.values(all)

    // Text search across name, email, company
    if (filters.search) {
      const q = filters.search.toLowerCase()
      results = results.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q)
      )
    }

    // Sort
    const sortBy = filters.sortBy || 'name'
    const sortDir = filters.sortDir || 'asc'
    results.sort((a, b) => {
      const va = (a[sortBy] || '').toString().toLowerCase()
      const vb = (b[sortBy] || '').toString().toLowerCase()
      return sortDir === 'desc' ? vb.localeCompare(va) : va.localeCompare(vb)
    })

    if (filters.limit) results = results.slice(0, filters.limit)
    return results
  })())
}

/**
 * Update a contact.
 * @param {string} ownerId
 * @param {string} cid
 * @param {Object} patch
 * @returns {AsyncResult}
 */
export function updateContact(ownerId, cid, patch) {
  return AsyncResult.from((async () => {
    patch.updatedAt = new Date().toISOString()
    if (patch.name) patch.name = patch.name.normalize('NFC')
    await dbUpdate(dbRef(`/contacts/${ownerId}/${cid}`), patch).unwrapOrThrow()
    return true
  })())
}

/**
 * Delete a contact.
 * @param {string} ownerId
 * @param {string} cid
 * @returns {AsyncResult}
 */
export function deleteContact(ownerId, cid) {
  return AsyncResult.from((async () => {
    await dbRemove(dbRef(`/contacts/${ownerId}/${cid}`)).unwrapOrThrow()
    return true
  })())
}

/**
 * Add a note to a contact.
 * @param {string} ownerId
 * @param {string} cid
 * @param {string} text
 * @returns {AsyncResult}
 */
export function addContactNote(ownerId, cid, text) {
  return AsyncResult.from((async () => {
    const nid = 'note_' + generateRandomHex(4)
    const note = {
      nid,
      text,
      createdAt: new Date().toISOString(),
    }
    await dbUpdate(dbRef(`/contacts/${ownerId}/${cid}/notes/${nid}`), note).unwrapOrThrow()
    return nid
  })())
}

/**
 * Get contact notes.
 * @param {string} ownerId
 * @param {string} cid
 * @returns {AsyncResult}
 */
export function getContactNotes(ownerId, cid) {
  return AsyncResult.from((async () => {
    const [contact, err] = await getContact(ownerId, cid).unwrap()
    if (err) throw err
    return contact.notes ? Object.values(contact.notes).sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    ) : []
  })())
}

/**
 * Track booking stats for a contact.
 * Updates totalBookings, lastBooking, noShowCount.
 *
 * @param {string} ownerId
 * @param {string} email — used to find contact by email
 * @param {Object} bookingData — { status, date }
 * @returns {AsyncResult}
 */
export function trackContactBooking(ownerId, email, bookingData) {
  return AsyncResult.from((async () => {
    if (!email) return null

    // Find contact by email
    const [contacts, listErr] = await listContacts(ownerId).unwrap()
    if (listErr) throw listErr

    const contact = (contacts || []).find(c => c.email === email)
    if (!contact) return null // No matching contact — skip

    const patch = {
      totalBookings: (contact.totalBookings || 0) + 1,
      lastBooking: bookingData.date || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (bookingData.status === 'no_show') {
      patch.noShowCount = (contact.noShowCount || 0) + 1
    }

    await updateContact(ownerId, contact.cid, patch).unwrapOrThrow()
    return contact.cid
  })())
}

/**
 * Add a contact to a list (tag-based grouping).
 * @param {string} ownerId
 * @param {string} cid
 * @param {string} listName — e.g. 'VIP', 'Enterprise', 'Trial'
 * @returns {AsyncResult}
 */
export function addContactToList(ownerId, cid, listName) {
  return AsyncResult.from((async () => {
    const [contact, err] = await getContact(ownerId, cid).unwrap()
    if (err) throw err
    const lists = contact.lists || []
    if (!lists.includes(listName)) {
      lists.push(listName)
      await updateContact(ownerId, cid, { lists }).unwrapOrThrow()
    }
    return lists
  })())
}

/**
 * Remove a contact from a list.
 * @param {string} ownerId
 * @param {string} cid
 * @param {string} listName
 * @returns {AsyncResult}
 */
export function removeContactFromList(ownerId, cid, listName) {
  return AsyncResult.from((async () => {
    const [contact, err] = await getContact(ownerId, cid).unwrap()
    if (err) throw err
    const lists = (contact.lists || []).filter(l => l !== listName)
    await updateContact(ownerId, cid, { lists }).unwrapOrThrow()
    return lists
  })())
}
