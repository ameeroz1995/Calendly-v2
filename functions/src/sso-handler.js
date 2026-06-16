/**
 * sso-handler.js — SAML/OIDC SSO via Firebase Auth (Google Cloud Identity Platform).
 *
 * Route: /login/sso
 * Provider discovery by email domain. Configures SAML provider in Firebase.
 * This function handles the SSO callback and user provisioning.
 *
 * Usage in Firebase Console:
 *   1. Enable Google Cloud Identity Platform
 *   2. Add SAML/OIDC providers per enterprise customer
 *   3. This function handles post-login profile creation
 */

import { onRequest } from 'firebase-functions/v2/https'
import { getDatabase } from 'firebase-admin/database'
import { getAuth } from 'firebase-admin/auth'
import { initializeApp } from 'firebase-admin/app'

initializeApp()

/** Map of email domains → SAML provider IDs configured in GCP Identity Platform */
const DOMAIN_PROVIDER_MAP = {
  // Example: 'acme.com': 'saml.acme-corp',
  // Configured in Firebase Console → Authentication → Sign-in method → SAML
}

export const ssohandler = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    const { action, email, uid } = req.body || {}

    if (action === 'discover') {
      return handleDiscover(req, res)
    }

    if (action === 'provision') {
      return handleProvision(req, res)
    }

    return res.status(400).json({ error: 'Invalid action. Use "discover" or "provision".' })
  }
)

/**
 * Discover SSO provider by email domain.
 * POST /api/sso { action: 'discover', email: 'user@acme.com' }
 * → { provider: 'saml.acme-corp', redirectUrl: '...' }
 */
async function handleDiscover(req, res) {
  const { email } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Email is required' })

  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return res.status(400).json({ error: 'Invalid email format' })

  const providerId = DOMAIN_PROVIDER_MAP[domain]

  if (!providerId) {
    return res.status(404).json({
      error: 'No SSO provider configured for this domain',
      fallback: true,
      message: 'Please sign in with Google or contact your administrator to set up SSO.',
    })
  }

  return res.status(200).json({
    provider: providerId,
    domain,
    redirectUrl: `/login/sso/${providerId}`,
  })
}

/**
 * Provision user profile after SSO login.
 * Called by client after Firebase Auth SSO completes.
 * POST /api/sso { action: 'provision', uid: '...' }
 */
async function handleProvision(req, res) {
  const { uid } = req.body || {}
  if (!uid) return res.status(400).json({ error: 'uid is required' })

  try {
    const auth = getAuth()
    const user = await auth.getUser(uid)

    const db = getDatabase()
    const userRef = db.ref(`/users/${uid}`)
    const existing = await userRef.get()

    if (!existing.val()) {
      // First SSO login — create profile
      const now = new Date().toISOString()
      await userRef.set({
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || null,
        provider: 'sso',
        plan: 'enterprise',
        maxEventTypes: 100,
        maxCalendarConnections: 10,
        createdAt: now,
        updatedAt: now,
      })

      console.log(`[sso] provisioned new user ${uid} (${user.email})`)
    } else {
      // Update last login
      await userRef.update({
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      })
    }

    return res.status(200).json({ success: true, uid })
  } catch (e) {
    console.error('[sso] provision failed:', e.message)
    return res.status(500).json({ error: 'Failed to provision user', details: e.message })
  }
}

/**
 * Register a new SSO domain-provider mapping (admin function).
 * Called by platform administrators to onboard new enterprise customers.
 */
export async function registerSsoProvider(domain, providerId) {
  DOMAIN_PROVIDER_MAP[domain.toLowerCase()] = providerId
  console.log(`[sso] registered provider ${providerId} for domain ${domain}`)
}

/**
 * Remove an SSO domain mapping.
 */
export async function removeSsoProvider(domain) {
  delete DOMAIN_PROVIDER_MAP[domain.toLowerCase()]
  console.log(`[sso] removed provider for domain ${domain}`)
}
