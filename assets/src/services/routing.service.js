/**
 * routing.service.js — Routing forms, pools, and round-robin assignment.
 *
 * Weighted round-robin with fallback by priority. Collective availability check.
 */

import { AsyncResult } from '../utils/Result.js'
import { dbRef, dbRead, dbWrite, dbUpdate, dbRemove, dbTransaction } from '../firebase.js'
import { generateRandomHex } from '../utils/crypto.js'

// ── Routing Forms ──

/**
 * Create a routing form.
 * @param {string} uid — owner UID
 * @param {Object} data — { name, questions:[], rules:[] }
 * @returns {AsyncResult}
 */
export function createRoutingForm(uid, data) {
  return AsyncResult.from((async () => {
    const fid = 'rf_' + generateRandomHex(8)
    const now = new Date().toISOString()
    await dbWrite(dbRef(`/routing_forms/${fid}`), {
      fid, uid, name: data.name, questions: data.questions || [], rules: data.rules || [],
      active: true, createdAt: now, updatedAt: now,
    }).unwrapOrThrow()
    return fid
  })())
}

/**
 * List routing forms for a user.
 * @param {string} uid
 * @returns {AsyncResult}
 */
export function listRoutingForms(uid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef('/routing_forms')).unwrap()
    if (err) throw err
    if (!data) return []
    return Object.values(data).filter(f => f.uid === uid)
  })())
}

/**
 * Get a single routing form.
 * @param {string} fid
 * @returns {AsyncResult}
 */
export function getRoutingForm(fid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/routing_forms/${fid}`)).unwrap()
    if (err) throw err
    if (!data) throw new Error('Routing form not found')
    return data
  })())
}

/**
 * Evaluate routing rules against form answers to find target pool.
 * @param {string} fid — form ID
 * @param {Object} answers — { questionId: answerValue }
 * @returns {AsyncResult} resolving to { poolId, strategy }
 */
export function evaluateRouting(fid, answers) {
  return AsyncResult.from((async () => {
    const [form, err] = await getRoutingForm(fid).unwrap()
    if (err) throw err

    if (!form.active) throw new Error('This routing form is no longer active')

    const rules = form.rules || []
    for (const rule of rules) {
      const answer = answers[rule.questionId]
      if (answer === rule.answer) {
        return { poolId: rule.poolId, strategy: rule.strategy || 'round_robin' }
      }
    }

    // Fallback to default pool
    if (form.defaultPoolId) {
      return { poolId: form.defaultPoolId, strategy: 'round_robin' }
    }

    throw new Error('No matching rule found and no default pool configured')
  })())
}

// ── Routing Pools ──

/**
 * Create a routing pool.
 * @param {string} uid — owner UID
 * @param {Object} data — { name, strategy:'round_robin'|'collective', members:[] }
 * @returns {AsyncResult}
 */
export function createPool(uid, data) {
  return AsyncResult.from((async () => {
    const pid = 'pl_' + generateRandomHex(8)
    const now = new Date().toISOString()
    const members = (data.members || []).map((m, i) => ({
      uid: m.uid,
      priority: m.priority || i + 1,
      name: m.name || '',
      addedAt: now,
    }))
    await dbWrite(dbRef(`/routing_pools/${pid}`), {
      pid, uid, name: data.name, strategy: data.strategy || 'round_robin',
      members, active: true, createdAt: now, updatedAt: now,
    }).unwrapOrThrow()
    return pid
  })())
}

/**
 * Get a pool by ID.
 * @param {string} pid
 * @returns {AsyncResult}
 */
export function getPool(pid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/routing_pools/${pid}`)).unwrap()
    if (err) throw err
    if (!data) throw new Error('Pool not found')
    return data
  })())
}

/**
 * List pools for a user.
 * @param {string} uid
 * @returns {AsyncResult}
 */
export function listPools(uid) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef('/routing_pools')).unwrap()
    if (err) throw err
    if (!data) return []
    return Object.values(data).filter(p => p.uid === uid)
  })())
}

/**
 * Round-robin assign: atomic counter + fallback chain by priority.
 *
 * @param {string} pid — pool ID
 * @param {string} requestedDate — ISO date
 * @param {string} requestedSlotId — slot being requested
 * @returns {AsyncResult} resolving to assigned member UID
 */
export function roundRobinAssign(pid, requestedDate, requestedSlotId) {
  return AsyncResult.from((async () => {
    const [pool, poolErr] = await getPool(pid).unwrap()
    if (poolErr) throw poolErr
    if (!pool.members || pool.members.length === 0) {
      // Empty pool: fall back to pool owner
      if (pool.uid) return pool.uid
      throw new Error('Pool is empty and has no owner assigned')
    }

    // Sort by priority (lower number = higher priority)
    const members = [...pool.members].sort((a, b) => (a.priority || 99) - (b.priority || 99))

    // Try members in priority order
    for (const member of members) {
      const [slots, slotsErr] = await checkMemberAvailability(member.uid, requestedDate).unwrap()
      if (slotsErr) continue
      const isFree = (slots || []).some(s => s.sid === requestedSlotId && s.status === 'free')
      if (isFree) {
        // Atomic counter increment
        const counterRef = dbRef(`/routing_counters/${pid}/${member.uid}`)
        await dbTransaction(counterRef, (current) => (current || 0) + 1).unwrapOrThrow()
        return member.uid
      }
    }

    // Fallback to pool owner if all members busy
    return pool.uid
  })())
}

/**
 * Check if a member has free slots on a given date.
 * @param {string} memberUid
 * @param {string} date — ISO date
 * @returns {AsyncResult}
 */
function checkMemberAvailability(memberUid, date) {
  return AsyncResult.from((async () => {
    const [data, err] = await dbRead(dbRef(`/availability/${memberUid}/${date}`)).unwrap()
    if (err) return []
    if (!data) return []
    return Object.values(data)
  })())
}

/**
 * Collective check: find slots where ALL pool members are free simultaneously.
 * @param {string} pid
 * @param {string} date — ISO date
 * @returns {AsyncResult} resolving to array of slot IDs where everyone is free
 */
export function collectiveCheck(pid, date) {
  return AsyncResult.from((async () => {
    const [pool, poolErr] = await getPool(pid).unwrap()
    if (poolErr) throw poolErr
    if (!pool.members || pool.members.length === 0) return []

    const memberSlots = []
    for (const member of pool.members) {
      const [slots] = await checkMemberAvailability(member.uid, date).unwrap()
      memberSlots.push(new Set((slots || []).filter(s => s.status === 'free').map(s => s.sid)))
    }

    // Intersection of all member slot sets
    const [first, ...rest] = memberSlots
    if (!first) return []
    const common = [...first].filter(sid => rest.every(s => s.has(sid)))
    return common
  })())
}

/**
 * Add a member to a pool.
 * @param {string} pid
 * @param {Object} member — { uid, name, priority }
 * @returns {AsyncResult}
 */
export function addPoolMember(pid, member) {
  return AsyncResult.from((async () => {
    const [pool, poolErr] = await getPool(pid).unwrap()
    if (poolErr) throw poolErr
    const members = [...(pool.members || []), {
      uid: member.uid,
      priority: member.priority || (pool.members || []).length + 1,
      name: member.name || '',
      addedAt: new Date().toISOString(),
    }]
    await dbUpdate(dbRef(`/routing_pools/${pid}`), {
      members,
      updatedAt: new Date().toISOString(),
    }).unwrapOrThrow()
    return true
  })())
}

/**
 * Remove a member from a pool.
 * @param {string} pid
 * @param {string} memberUid
 * @returns {AsyncResult}
 */
export function removePoolMember(pid, memberUid) {
  return AsyncResult.from((async () => {
    const [pool, poolErr] = await getPool(pid).unwrap()
    if (poolErr) throw poolErr
    const members = (pool.members || []).filter(m => m.uid !== memberUid)
    await dbUpdate(dbRef(`/routing_pools/${pid}`), {
      members,
      updatedAt: new Date().toISOString(),
    }).unwrapOrThrow()
    return true
  })())
}
