/**
 * oauth-token-exchange.js — OAuth token exchange handler.
 *
 * Trigger: HTTP POST /api/oauth/callback
 * Receives auth code from client, exchanges for tokens server-side,
 * encrypts with AES-256-GCM, stores encrypted blob in RTDB.
 * Client never receives raw access/refresh tokens.
 * Validates CSRF state parameter.
 */

import { onRequest } from 'firebase-functions/v2/https'
import { getDatabase } from 'firebase-admin/database'
import { initializeApp } from 'firebase-admin/app'
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

initializeApp()

const ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY // 32-byte hex string
if (!ENCRYPTION_KEY) {
  throw new Error('FATAL: OAUTH_ENCRYPTION_KEY environment variable is required. Deploy aborted.')
}

export const oauthtokenexchange = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    if (!ENCRYPTION_KEY) {
      return res.status(500).json({ error: 'Server configuration error' })
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { code, state, provider, uid } = req.body || {}

    if (!code || !state || !provider || !uid) {
      return res.status(400).json({ error: 'Missing required fields: code, state, provider, uid' })
    }

    if (!['google', 'microsoft'].includes(provider)) {
      return res.status(400).json({ error: 'Unsupported provider' })
    }

    // Validate CSRF state
    const db = getDatabase()
    const pendingSnap = await db.ref(`/calendar_connections/${uid}/_pending`).get()
    const pending = pendingSnap.val()

    if (!pending || pending.state !== state) {
      return res.status(403).json({ error: 'Invalid CSRF state parameter' })
    }

    try {
      // Exchange code for tokens
      const tokens = await exchangeCode(code, provider)

      // Encrypt tokens before storage
      const encrypted = encryptTokens(tokens)

      // Store encrypted tokens
      const cid = 'cal_' + randomBytes(4).toString('hex')
      const now = new Date().toISOString()

      await db.ref(`/calendar_connections/${uid}/${cid}`).set({
        cid,
        provider,
        email: tokens.email || 'unknown',
        encryptedTokens: encrypted,
        status: 'active',
        lastSync: now,
        createdAt: now,
      })

      // Clean up pending state
      await db.ref(`/calendar_connections/${uid}/_pending`).remove()

      return res.status(200).json({ success: true, cid })
    } catch (e) {
      console.error('[oauth] token exchange failed:', e.message)
      return res.status(500).json({ error: 'Token exchange failed', details: e.message })
    }
  }
)

/**
 * Exchange authorization code for access + refresh tokens.
 */
async function exchangeCode(code, provider) {
  const clientId = provider === 'google'
    ? process.env.GOOGLE_CLIENT_ID
    : process.env.MICROSOFT_CLIENT_ID
  const clientSecret = provider === 'google'
    ? process.env.GOOGLE_CLIENT_SECRET
    : process.env.MICROSOFT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error(`Missing OAuth credentials for ${provider}`)
  }

  const redirectUri = `${process.env.APP_URL || 'http://localhost:5000'}/api/oauth/callback`

  let tokenUrl, body
  if (provider === 'google') {
    tokenUrl = 'https://oauth2.googleapis.com/token'
    body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    })
  } else {
    tokenUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/token`
    body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    })
  }

  const resp = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!resp.ok) {
    const err = await resp.text().catch(() => '')
    throw new Error(`Token exchange failed (${resp.status}): ${err}`)
  }

  const data = await resp.json()

  // For Google, fetch user email if not in token response
  let email = data.email || ''
  if (!email && provider === 'google' && data.access_token) {
    try {
      const userResp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      })
      if (userResp.ok) {
        const userInfo = await userResp.json()
        email = userInfo.email || ''
      }
    } catch (_) { /* non-critical */ }
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    expiresIn: data.expires_in || 3600,
    email,
  }
}

/**
 * Encrypt tokens with AES-256-GCM.
 * @returns {Object} { ciphertext, iv, tag, algorithm: 'AES-256-GCM' }
 */
function encryptTokens(tokens) {
  if (!ENCRYPTION_KEY) throw new Error('Server configuration error: OAUTH_ENCRYPTION_KEY is not set')
  const key = Buffer.from(ENCRYPTION_KEY, 'hex')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)

  const plaintext = JSON.stringify(tokens)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    ciphertext: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    algorithm: 'AES-256-GCM',
  }
}

/**
 * Decrypt tokens (used by sync/refresh operations).
 */
export function decryptTokens(encrypted) {
  if (!ENCRYPTION_KEY) throw new Error('Server configuration error: OAUTH_ENCRYPTION_KEY is not set')
  const key = Buffer.from(ENCRYPTION_KEY, 'hex')
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(encrypted.iv, 'hex'))
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, 'hex')),
    decipher.final(),
  ])

  return JSON.parse(decrypted.toString('utf8'))
}
