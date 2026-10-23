import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const KEY = 'kp-intro-seen'
function firstVisit() {
  try {
    return !sessionStorage.getItem(KEY)
  } catch {
    return false // storage blocked: skip the intro rather than replay it every time
  }
}
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Once per visit: the deck shuffles, then deals out and reveals the page.
export const INTRO = !reduced && firstVisit()
// hero entrance waits for the deal (seconds)
export const INTRO_DELAY = INTRO ? 1.25 : 0

const CARDS = [-2, -1, 0, 1, 2]
const DUR = 1.5

export default function Intro() {
  const [open, setOpen] = useState(INTRO)
  const [out] = useState(() =>
    CARDS.map((i) => ({ x: (i || 0.4) * window.innerWidth * 0.7, y: (i % 2 ? 1 : -1) * window.innerHeight * 0.8, r: i * 60 + 30 })),
  )

  useEffect(() => {
    if (!open) return
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* private mode: fine */
    }
    const t = setTimeout(() => setOpen(false), DUR * 1000)
    return () => clearTimeout(t)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          aria-hidden
          onClick={() => setOpen(false)}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[200] grid touch-none place-items-center overflow-hidden bg-ink"
          style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 50%, #0d3b26 0%, var(--color-ink) 70%)' }}
        >
          <div className="relative h-[134px] w-24">
            {CARDS.map((i, k) => (
              <motion.div
                key={i}
                className="card-face card-back-pattern border border-gold/40 shadow-[0_20px_40px_rgb(0_0_0/0.6)] will-change-transform"
                initial={{ x: 0, y: k * -2, rotate: i * 1.5, opacity: 0, scale: 0.8 }}
                // fan out → snap back into a deck → deal off in all directions
                animate={{
                  x: [0, i * 44, 0, out[k].x],
                  y: [k * -2, Math.abs(i) * 10, k * -2, out[k].y],
                  rotate: [i * 1.5, i * 14, 0, out[k].r],
                  opacity: [0, 1, 1, 1],
                  scale: [0.8, 1, 1, 0.9],
                }}
                transition={{ duration: DUR, times: [0, 0.32, 0.55, 1], ease: [0.65, 0, 0.35, 1] }}
              />
            ))}
          </div>
          <motion.div
            className="absolute bottom-[22%] font-mono text-[11px] uppercase tracking-[0.3em] text-gold"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 1, 1, 0], y: 0 }}
            transition={{ duration: DUR, times: [0, 0.25, 0.7, 1] }}
          >
            Shuffling the deck…
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
