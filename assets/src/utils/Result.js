/**
 * Result & AsyncResult — Fluent error-handling primitives.
 *
 * Construction:
 *   Result.from(thunk)          — sync thunk, catches throws
 *   Result.ok(value)            — wrap a known value
 *   Result.err(error)           — wrap a known error
 *   AsyncResult.from(thunk)     — async thunk, catches sync throws + rejections
 *   AsyncResult.fromPromise(p)  — convenience for already-created promises
 *
 * Transform:
 *   .map(fn)        — transform value → new Result      (skip if errored, catches mapper throws)
 *   .flatMap(fn)    — fn returns Result → flattened
 *   .mapErr(fn)     — transform error → new Result
 *
 * Side effects:
 *   .tap(fn)        — side-effect on value, pass through
 *   .tapErr(fn)     — side-effect on error, pass through
 *
 * Recovery:
 *   .recover(fn)    — fn(err) → new Result
 *
 * Extract:
 *   .unwrap()        — → [value, error] tuple
 *   .unwrapOr(val)   — → value | fallback if errored
 *   .unwrapOrThrow() — → value | throws if errored (AsyncResult)
 */

// ── Result (sync) ────────────────────────────────────────────────

class Result {
  #ok
  #value
  #error

  constructor(ok, value, error) {
    this.#ok = ok
    this.#value = value
    this.#error = error
  }

  get ok() { return this.#ok }

  static ok(value) {
    return new Result(true, value, null)
  }

  static err(error) {
    return new Result(false, null, error)
  }

  /**
   * Execute a sync thunk, catching any thrown errors.
   */
  static from(thunk) {
    try {
      const value = thunk()
      return new Result(true, value, null)
    } catch (e) {
      return new Result(false, null, e)
    }
  }

  map(fn) {
    if (!this.#ok) return this
    return Result.from(() => fn(this.#value))
  }

  flatMap(fn) {
    if (!this.#ok) return this
    try {
      return fn(this.#value)
    } catch (e) {
      return Result.err(e)
    }
  }

  mapErr(fn) {
    if (this.#ok) return this
    return Result.from(() => { throw fn(this.#error) })
  }

  tap(fn) {
    if (this.#ok) {
      try { fn(this.#value) } catch (_) { /* swallowed by design */ }
    }
    return this
  }

  tapErr(fn) {
    if (!this.#ok) {
      try { fn(this.#error) } catch (_) { /* swallowed by design */ }
    }
    return this
  }

  recover(fn) {
    if (this.#ok) return this
    try {
      return fn(this.#error)
    } catch (e) {
      return Result.err(e)
    }
  }

  unwrap() {
    if (this.#ok) return [this.#value, null]
    return [null, this.#error]
  }

  unwrapOr(fallback) {
    return this.#ok ? this.#value : fallback
  }

  unwrapOrThrow() {
    if (this.#ok) return this.#value
    throw this.#error
  }
}

// ── AsyncResult (async) ──────────────────────────────────────────

class AsyncResult {
  #promise

  constructor(promise) {
    this.#promise = promise
  }

  static from(thunk) {
    return new AsyncResult(
      (async () => {
        try {
          const value = await thunk()
          return [true, value, null]
        } catch (e) {
          return [false, null, e]
        }
      })()
    )
  }

  static fromPromise(promise) {
    return new AsyncResult(
      (async () => {
        try {
          const value = await promise
          return [true, value, null]
        } catch (e) {
          return [false, null, e]
        }
      })()
    )
  }

  static ok(value) {
    return new AsyncResult(Promise.resolve([true, value, null]))
  }

  static err(error) {
    return new AsyncResult(Promise.resolve([false, null, error]))
  }

  map(fn) {
    return new AsyncResult(
      this.#promise.then(([ok, value, error]) => {
        if (!ok) return [false, null, error]
        try {
          return [true, fn(value), null]
        } catch (e) {
          return [false, null, e]
        }
      })
    )
  }

  flatMap(fn) {
    return new AsyncResult(
      this.#promise.then(async ([ok, value, error]) => {
        if (!ok) return [false, null, error]
        try {
          const result = await fn(value)
          if (result instanceof AsyncResult) return result.#promise
          if (result instanceof Result) {
            const [val, err] = result.unwrap()
            return [result.ok, val, err]
          }
          return [true, result, null]
        } catch (e) {
          return [false, null, e]
        }
      })
    )
  }

  mapErr(fn) {
    return new AsyncResult(
      this.#promise.then(([ok, value, error]) => {
        if (ok) return [true, value, null]
        return [false, null, fn(error)]
      })
    )
  }

  tap(fn) {
    return new AsyncResult(
      this.#promise.then(([ok, value, error]) => {
        if (ok) {
          try { fn(value) } catch (_) { /* swallowed */ }
        }
        return [ok, value, error]
      })
    )
  }

  tapErr(fn) {
    return new AsyncResult(
      this.#promise.then(([ok, value, error]) => {
        if (!ok) {
          try { fn(error) } catch (_) { /* swallowed */ }
        }
        return [ok, value, error]
      })
    )
  }

  recover(fn) {
    return new AsyncResult(
      this.#promise.then(async ([ok, value, error]) => {
        if (ok) return [true, value, null]
        try {
          const recovered = await fn(error)
          if (recovered instanceof Result) return recovered.unwrap()
          return [true, recovered, null]
        } catch (e) {
          return [false, null, e]
        }
      })
    )
  }

  async unwrap() {
    const [ok, value, error] = await this.#promise
    if (ok) return [value, null]
    return [null, error]
  }

  async unwrapOr(fallback) {
    const [ok, value] = await this.#promise
    return ok ? value : fallback
  }

  async unwrapOrThrow() {
    const [ok, value, error] = await this.#promise
    if (ok) return value
    throw error
  }

  then(onFulfilled, onRejected) {
    return this.#promise.then(onFulfilled, onRejected)
  }
}

export { Result, AsyncResult }
