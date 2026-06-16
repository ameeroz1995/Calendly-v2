/**
 * Result.test.js — Unit tests for Result and AsyncResult.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Result, AsyncResult } from './Result.js'

describe('Result (sync)', () => {
  it('ok() creates success', () => {
    const r = Result.ok(42)
    assert.equal(r.ok, true)
    assert.equal(!r.ok, false)
    const [v, e] = r.unwrap()
    assert.equal(v, 42)
    assert.equal(e, null)
  })

  it('err() creates error', () => {
    const r = Result.err(new Error('fail'))
    assert.equal(r.ok, false)
    assert.equal(!r.ok, true)
    const [v, e] = r.unwrap()
    assert.equal(v, null)
    assert.ok(e instanceof Error)
  })

  it('from() catches sync throws', () => {
    const r = Result.from(() => { throw new Error('boom') })
    const [v, e] = r.unwrap()
    assert.equal(v, null)
    assert.equal(e.message, 'boom')
  })

  it('from() wraps return value', () => {
    const r = Result.from(() => 99)
    const [v] = r.unwrap()
    assert.equal(v, 99)
  })

  it('map() transforms success', () => {
    const r = Result.ok(10).map(x => x * 2)
    assert.equal(r.unwrap()[0], 20)
  })

  it('map() skips on error', () => {
    const r = Result.err(new Error('nope')).map(x => x * 2)
    assert.equal(!r.ok, true)
  })

  it('map() catches mapper throws', () => {
    const r = Result.ok(1).map(() => { throw new Error('mapper fail') })
    assert.equal(!r.ok, true)
  })

  it('flatMap() returns nested Result', () => {
    const r = Result.ok(5).flatMap(x => Result.ok(x * 3))
    assert.equal(r.unwrap()[0], 15)
  })

  it('flatMap() skips on error', () => {
    const r = Result.err(new Error('base')).flatMap(x => Result.ok(x))
    assert.equal(!r.ok, true)
  })

  it('mapErr() transforms error', () => {
    const r = Result.err(new Error('a')).mapErr(e => new Error('b: ' + e.message))
    assert.equal(r.unwrap()[1].message, 'b: a')
  })

  it('mapErr() skips on success', () => {
    const r = Result.ok(1).mapErr(e => new Error('ignored'))
    assert.equal(r.unwrap()[0], 1)
  })

  it('tap() side-effects on success', () => {
    let side = 0
    Result.ok(7).tap(x => { side = x })
    assert.equal(side, 7)
  })

  it('tap() skips on error', () => {
    let side = 0
    Result.err(new Error('x')).tap(() => { side = 99 })
    assert.equal(side, 0)
  })

  it('tapErr() side-effects on error', () => {
    let side = ''
    Result.err(new Error('msg')).tapErr(e => { side = e.message })
    assert.equal(side, 'msg')
  })

  it('recover() transforms error to success', () => {
    const r = Result.err(new Error('fail')).recover(() => Result.ok('recovered'))
    assert.equal(r.unwrap()[0], 'recovered')
    assert.equal(r.ok, true)
  })

  it('unwrapOr() returns value on success', () => {
    assert.equal(Result.ok(5).unwrapOr(10), 5)
  })

  it('unwrapOr() returns fallback on error', () => {
    assert.equal(Result.err(new Error('x')).unwrapOr(10), 10)
  })

  it('unwrapOrThrow() returns value on success', () => {
    assert.equal(Result.ok(5).unwrapOrThrow(), 5)
  })

  it('unwrapOrThrow() throws on error', () => {
    assert.throws(() => Result.err(new Error('crash')).unwrapOrThrow(), /crash/)
  })
})

describe('AsyncResult', () => {
  it('from() resolves promise', async () => {
    const r = AsyncResult.from(() => Promise.resolve(42))
    const [v, e] = await r.unwrap()
    assert.equal(v, 42)
    assert.equal(e, null)
  })

  it('from() catches rejected promise', async () => {
    const r = AsyncResult.from(() => Promise.reject(new Error('async fail')))
    const [v, e] = await r.unwrap()
    assert.equal(v, null)
    assert.equal(e.message, 'async fail')
  })

  it('from() catches sync throw in factory', async () => {
    const r = AsyncResult.from(() => { throw new Error('sync fail') })
    const [v, e] = await r.unwrap()
    assert.equal(v, null)
    assert.equal(e.message, 'sync fail')
  })

  it('ok() shortcut', async () => {
    const [v] = await AsyncResult.ok(10).unwrap()
    assert.equal(v, 10)
  })

  it('err() shortcut', async () => {
    const [, e] = await AsyncResult.err(new Error('e')).unwrap()
    assert.equal(e.message, 'e')
  })

  it('map() chains async mappers', async () => {
    const r = AsyncResult.ok(5).map(x => x * 3)
    const [v] = await r.unwrap()
    assert.equal(v, 15)
  })

  it('map() skips on error', async () => {
    const r = AsyncResult.err(new Error('no')).map(x => x * 2)
    const [, e] = await r.unwrap()
    assert.equal(e.message, 'no')
  })

  it('flatMap() with AsyncResult return', async () => {
    const r = AsyncResult.ok(2).flatMap(x => Result.ok(x * 100))
    const [v] = await r.unwrap()
    assert.equal(v, 200)
  })

  it('flatMap() with Result.err propagates error', async () => {
    const r = AsyncResult.ok(2).flatMap(x => Result.err(new Error('flat fail')))
    const [v, e] = await r.unwrap()
    assert.equal(v, null)
    assert.equal(e.message, 'flat fail')
  })

  it('recover() from error', async () => {
    const r = AsyncResult.err(new Error('boom')).recover(() => 'safe')
    const [v] = await r.unwrap()
    assert.equal(v, 'safe')
  })

  it('tap() fires on success', async () => {
    let side = 0
    await AsyncResult.ok(3).tap(x => { side = x }).unwrap()
    assert.equal(side, 3)
  })

  it('tapErr() fires on error', async () => {
    let side = ''
    await AsyncResult.err(new Error('log')).tapErr(e => { side = e.message }).unwrap()
    assert.equal(side, 'log')
  })

  it('unwrapOr() returns fallback on error', async () => {
    const v = await AsyncResult.err(new Error('x')).unwrapOr('default')
    assert.equal(v, 'default')
  })

  it('unwrapOrThrow() throws on error', async () => {
    await assert.rejects(() => AsyncResult.err(new Error('crash')).unwrapOrThrow(), /crash/)
  })
})
