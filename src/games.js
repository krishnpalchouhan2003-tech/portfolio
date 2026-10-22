// Pure math for the demo games. ~1% house edge, like real operators.

export const CRASH_RATE = 0.15 // growth per second: 2× at ~4.6s
export const crashAt = (ms) => Math.exp((CRASH_RATE * ms) / 1000)
// P(point >= x) = 0.99 / x
export const crashPoint = (r = Math.random()) => Math.max(1, Math.floor(99 / (1 - r)) / 100)

export const TILES = 25
// fair odds of surviving `safe` picks, times 0.99
export function minesMultiplier(mines, safe) {
  let m = 0.99
  for (let i = 0; i < safe; i++) m *= (TILES - i) / (TILES - mines - i)
  return m
}
export function placeMines(count, rand = Math.random) {
  const s = new Set()
  while (s.size < count) s.add(Math.floor(rand() * TILES))
  return s
}

export const PLINKO_ROWS = 8
export const PLINKO_PAYOUTS = [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13]
// one left (0) / right (1) bounce per row; the bucket is the number of rights
export const plinkoPath = (rand = Math.random) =>
  Array.from({ length: PLINKO_ROWS }, () => (rand() < 0.5 ? 0 : 1))
