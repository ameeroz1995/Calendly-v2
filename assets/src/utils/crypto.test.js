/**
 * crypto.test.js — Unit tests for crypto wrappers.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  encryptAES256GCM, decryptAES256GCM, hashSHA256,
  generateApiKey, hashApiKey, verifyApiKey,
  generateRandomBytes, generateRandomHex,
} from './crypto.js'

describe('encryptAES256GCM / decryptAES256GCM', () => {
  it('round-trips plaintext correctly', async () => {
    const plaintext = 'sensitive data: patient name = John Doe'
    const password = 'strong-password-123'
    const encrypted = await encryptAES256GCM(plaintext, password)
    assert.ok(encrypted.ciphertext)
    assert.ok(encrypted.iv)
    assert.ok(encrypted.salt)
    const decrypted = await decryptAES256GCM(encrypted.ciphertext, password, encrypted.iv, encrypted.salt)
    assert.equal(decrypted, plaintext)
  })

  it('different passwords produce different ciphertexts', async () => {
    const e1 = await encryptAES256GCM('hello', 'pass1')
    const e2 = await encryptAES256GCM('hello', 'pass2')
    assert.notEqual(e1.ciphertext, e2.ciphertext)
  })

  it('wrong password fails decryption', async () => {
    const encrypted = await encryptAES256GCM('secret', 'correct')
    await assert.rejects(() => decryptAES256GCM(encrypted.ciphertext, 'wrong', encrypted.iv, encrypted.salt))
  })

  it('empty plaintext works', async () => {
    const encrypted = await encryptAES256GCM('', 'pass')
    const decrypted = await decryptAES256GCM(encrypted.ciphertext, 'pass', encrypted.iv, encrypted.salt)
    assert.equal(decrypted, '')
  })

  it('unicode plaintext round-trips', async () => {
    const plaintext = 'Hello 世界 🌍'
    const encrypted = await encryptAES256GCM(plaintext, 'pass')
    const decrypted = await decryptAES256GCM(encrypted.ciphertext, 'pass', encrypted.iv, encrypted.salt)
    assert.equal(decrypted, plaintext)
  })
})

describe('hashSHA256', () => {
  it('produces 64-char hex hash', async () => {
    const hash = await hashSHA256('hello')
    assert.equal(hash.length, 64)
  })

  it('same input produces same hash', async () => {
    const h1 = await hashSHA256('same-data')
    const h2 = await hashSHA256('same-data')
    assert.equal(h1, h2)
  })

  it('different input produces different hash', async () => {
    const h1 = await hashSHA256('data1')
    const h2 = await hashSHA256('data2')
    assert.notEqual(h1, h2)
  })
})

describe('generateRandomBytes', () => {
  it('produces correct byte count', () => {
    const bytes = generateRandomBytes(16)
    assert.equal(bytes.length, 16)
  })

  it('produces different values on each call', () => {
    const a = generateRandomBytes(32)
    const b = generateRandomBytes(32)
    // Extremely unlikely to be equal
    assert.notEqual(Buffer.from(a).toString('hex'), Buffer.from(b).toString('hex'))
  })
})

describe('generateRandomHex', () => {
  it('produces hex of correct length', () => {
    const hex = generateRandomHex(8) // 8 bytes = 16 hex chars
    assert.equal(hex.length, 16)
  })
})

describe('generateApiKey', () => {
  it('generates key with cal_live_ prefix', () => {
    const { raw, prefix } = generateApiKey('live')
    assert.ok(raw.startsWith('cal_live_'))
    assert.equal(prefix, 'cal_live_')
    assert.ok(raw.length > 10)
  })

  it('generates key with cal_dev_ prefix', () => {
    const { raw, prefix } = generateApiKey('dev')
    assert.ok(raw.startsWith('cal_dev_'))
    assert.equal(prefix, 'cal_dev_')
  })

  it('each key is unique', () => {
    const a = generateApiKey('live')
    const b = generateApiKey('live')
    assert.notEqual(a.raw, b.raw)
  })

  it('returns hash promise', async () => {
    const { hash } = generateApiKey('live')
    const result = await hash
    assert.ok(result.hash)
    assert.ok(result.salt)
    assert.equal(result.hash.length, 64)
  })
})

describe('hashApiKey / verifyApiKey', () => {
  it('verifies correct key', async () => {
    const rawKey = 'cal_live_testkey1234567890abcdef'
    const { hash, salt } = await hashApiKey(rawKey)
    const ok = await verifyApiKey(rawKey, hash, salt)
    assert.equal(ok, true)
  })

  it('rejects wrong key', async () => {
    const rawKey = 'cal_live_testkey1234567890abcdef'
    const { hash, salt } = await hashApiKey(rawKey)
    const ok = await verifyApiKey('cal_live_wrongkey', hash, salt)
    assert.equal(ok, false)
  })

  it('rejects with wrong salt', async () => {
    const rawKey = 'cal_live_testkey1234567890abcdef'
    const { hash } = await hashApiKey(rawKey)
    const wrongSalt = 'a'.repeat(32) // 16 bytes = 32 hex chars
    const ok = await verifyApiKey(rawKey, hash, wrongSalt)
    assert.equal(ok, false)
  })
})
