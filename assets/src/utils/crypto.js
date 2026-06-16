/**
 * crypto.js — Web Crypto API wrappers.
 *
 * Uses the browser-native crypto.subtle for:
 *   - AES-256-GCM encrypt/decrypt
 *   - SHA-256 hashing
 *   - PBKDF2 key derivation (100K iterations for API key hashing)
 *   - Cryptographically secure random bytes
 *
 * All operations return Promises. Zero external dependencies.
 *
 * Usage:
 *   import { encryptAES256GCM, hashApiKey, generateApiKey } from './utils/crypto.js'
 *   const encrypted = await encryptAES256GCM(plaintext, key)
 *   const keyHash = await hashApiKey('cal_live_abc123...')
 */

// ── Constants ──
const ENC_ALGO = 'AES-GCM'
const ENC_KEY_LEN = 256
const HASH_ALGO = 'SHA-256'
const PBKDF2_ITERATIONS = 100000
const API_KEY_PREFIX_LIVE = 'cal_live_'
const API_KEY_PREFIX_DEV = 'cal_dev_'
const API_KEY_RANDOM_BYTES = 32
const API_KEY_HASH_LEN = 256

// ── Helpers ──

/** Convert ArrayBuffer to hex string */
function buf2hex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Convert hex string to ArrayBuffer */
function hex2buf(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes.buffer
}

/** Convert string to Uint8Array (UTF-8) */
function str2buf(str) {
  return new TextEncoder().encode(str)
}

/** Convert ArrayBuffer to string (UTF-8) */
function buf2str(buf) {
  return new TextDecoder().decode(buf)
}

/**
 * Generate an AES-256-GCM encryption key from a password string.
 * Uses PBKDF2 to derive a 256-bit key.
 *
 * @param {string} password — raw secret
 * @param {Uint8Array} salt — random salt (store alongside ciphertext)
 * @returns {Promise<CryptoKey>}
 */
export async function deriveKey(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw', str2buf(password), 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: ENC_ALGO, length: ENC_KEY_LEN },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt plaintext using AES-256-GCM.
 *
 * @param {string} plaintext — data to encrypt
 * @param {string} password — encryption password
 * @returns {Promise<{ ciphertext: string, iv: string, salt: string }>}
 *   All values are hex-encoded. Store all three to decrypt later.
 */
export async function encryptAES256GCM(plaintext, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)

  const encrypted = await crypto.subtle.encrypt(
    { name: ENC_ALGO, iv },
    key,
    str2buf(plaintext)
  )

  return {
    ciphertext: buf2hex(encrypted),
    iv: buf2hex(iv),
    salt: buf2hex(salt),
  }
}

/**
 * Decrypt AES-256-GCM ciphertext.
 *
 * @param {string} ciphertext — hex-encoded encrypted data
 * @param {string} password — same password used for encryption
 * @param {string} iv — hex-encoded initialization vector
 * @param {string} salt — hex-encoded salt
 * @returns {Promise<string>} — decrypted plaintext
 */
export async function decryptAES256GCM(ciphertext, password, iv, salt) {
  const key = await deriveKey(password, hex2buf(salt))
  const decrypted = await crypto.subtle.decrypt(
    { name: ENC_ALGO, iv: hex2buf(iv) },
    key,
    hex2buf(ciphertext)
  )
  return buf2str(decrypted)
}

/**
 * Hash data using SHA-256.
 *
 * @param {string} data — data to hash
 * @returns {Promise<string>} — hex-encoded hash
 */
export async function hashSHA256(data) {
  const hash = await crypto.subtle.digest(HASH_ALGO, str2buf(data))
  return buf2hex(hash)
}

/**
 * Generate cryptographically secure random bytes.
 *
 * @param {number} n — number of bytes
 * @returns {Uint8Array}
 */
export function generateRandomBytes(n) {
  return crypto.getRandomValues(new Uint8Array(n))
}

/**
 * Generate a random hex string of given byte length.
 *
 * @param {number} byteLength
 * @returns {string} — hex-encoded
 */
export function generateRandomHex(byteLength) {
  return buf2hex(crypto.getRandomValues(new Uint8Array(byteLength)))
}

/**
 * Generate an API key with prefix.
 *
 * Format: cal_live_<32 random alphanumeric chars>
 * The caller MUST display the key only once and store only the hash.
 *
 * @param {'live'|'dev'} [env='live']
 * @returns {{ raw: string, prefix: string, hash: Promise<string> }}
 */
export function generateApiKey(env = 'live') {
  const prefix = env === 'dev' ? API_KEY_PREFIX_DEV : API_KEY_PREFIX_LIVE
  // Generate random bytes, encode as URL-safe base64-like alphanumeric
  const bytes = generateRandomBytes(API_KEY_RANDOM_BYTES)
  // Map each byte to alphanumeric: [0-9a-zA-Z] = 62 chars
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let randomPart = ''
  for (let i = 0; i < bytes.length; i++) {
    randomPart += chars[bytes[i] % chars.length]
  }
  const raw = prefix + randomPart
  return {
    raw,
    prefix,
    hash: hashApiKey(raw),
  }
}

/**
 * Hash an API key using PBKDF2 with 100K iterations.
 * The raw key is never stored — only this hash is written to RTDB.
 *
 * @param {string} rawKey — the full raw API key
 * @param {Uint8Array} [salt] — optional salt (generated if not provided)
 * @returns {Promise<{ hash: string, salt: string }>} — hex-encoded hash + salt
 */
export async function hashApiKey(rawKey, salt) {
  if (!salt) salt = crypto.getRandomValues(new Uint8Array(16))

  const keyMaterial = await crypto.subtle.importKey(
    'raw', str2buf(rawKey), 'PBKDF2', false, ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    API_KEY_HASH_LEN
  )
  return {
    hash: buf2hex(bits),
    salt: buf2hex(salt),
  }
}

/**
 * Verify a raw API key against a stored hash + salt.
 *
 * @param {string} rawKey — the key provided in the request
 * @param {string} storedHash — hex-encoded hash from RTDB
 * @param {string} storedSalt — hex-encoded salt from RTDB
 * @returns {Promise<boolean>}
 */
export async function verifyApiKey(rawKey, storedHash, storedSalt) {
  const { hash } = await hashApiKey(rawKey, hex2buf(storedSalt))
  return hash === storedHash
}
