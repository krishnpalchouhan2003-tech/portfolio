let busyUntil = 0

export function buzz(pattern) {
  const now = performance.now()
  if (now < busyUntil) return
  if (!globalThis.navigator?.vibrate?.(pattern)) return
  busyUntil = now + [].concat(pattern).reduce((a, b) => a + b, 0)
}
