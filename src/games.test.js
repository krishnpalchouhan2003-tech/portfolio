import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crashPoint, minesMultiplier, placeMines, PLINKO_PAYOUTS, PLINKO_ROWS, plinkoPath } from './games.js'

test('crash point', () => {
  assert.equal(crashPoint(0), 1)
  assert.equal(crashPoint(0.5), 1.98)
  assert.ok(crashPoint(0.99) > crashPoint(0.9))
})

test('mines multiplier', () => {
  assert.equal(minesMultiplier(3, 0), 0.99)
  assert.equal(minesMultiplier(24, 1), 0.99 * 25)
  assert.ok(Math.abs(minesMultiplier(1, 1) - 0.99 * (25 / 24)) < 1e-9)
  assert.equal(placeMines(10).size, 10)
})

test('plinko pays back just under 100%', () => {
  const choose = (n, k) => (k === 0 ? 1 : (choose(n, k - 1) * (n - k + 1)) / k)
  const ev = PLINKO_PAYOUTS.reduce((s, x, k) => s + (x * choose(PLINKO_ROWS, k)) / 2 ** PLINKO_ROWS, 0)
  assert.ok(ev > 0.95 && ev < 1, `EV ${ev}`)
  const p = plinkoPath()
  assert.equal(p.length, PLINKO_ROWS)
  assert.ok(p.every((s) => s === 0 || s === 1))
})
