import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import SplitText from './SplitText'

// chips slide in from the corners (from = fraction of the screen) and stack under the title
const chips = [
  { color: '#c8102e', from: [-0.6, -0.45], to: [-42, 150], spin: 540 },
  { color: '#1f3fbf', from: [0.6, -0.4], to: [42, 150], spin: -480 },
  { color: '#0b6e4f', from: [-0.55, 0.5], to: [-42, 132], spin: 420 },
  { color: '#111111', from: [0.55, 0.45], to: [42, 132], spin: -600 },
]

function Chip({ c, p }) {
  const x = useTransform(p, [0, 0.45], [c.from[0] * window.innerWidth, c.to[0]])
  const y = useTransform(p, [0, 0.45], [c.from[1] * window.innerHeight, c.to[1]])
  const rotate = useTransform(p, [0, 0.45], [c.spin, 0])
  return (
    <motion.div
      aria-hidden
      className="chip absolute left-1/2 top-1/2 -ml-8 -mt-8 size-16 will-change-transform sm:-ml-10 sm:-mt-10 sm:size-20"
      style={{ '--chip': c.color, x, y, rotate }}
    />
  )
}

// A short scroll "pause" before the games: the screen holds while the chips go down, then zooms through into the casino.
export default function PlaceBets() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // light spring so phones glide instead of stepping with each touch-scroll update
  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 32, restDelta: 0.0005 })
  const zoom = useTransform(p, [0.5, 0.85], [1, 1.6]) // kept small: bigger scale-ups blur the text
  const fade = useTransform(p, (v) => (v < 0.5 ? 1 : Math.max(0, 1 - (v - 0.5) / 0.3)))
  const hint = useTransform(p, (v) => Math.max(0, 1 - v / 0.2))

  return (
    <section id="bets" ref={ref} aria-label="Play for free" className="relative -mb-[40svh] h-[200vh]">
      <div className="sticky top-0 grid h-svh place-items-center overflow-hidden">
        <motion.div
          aria-hidden
          style={{ opacity: fade, background: 'radial-gradient(ellipse 80% 60% at 50% 50%, #0d3b26 0%, transparent 70%)' }}
          className="absolute inset-0"
        />
        <motion.div style={{ scale: zoom, opacity: fade }} className="relative grid place-items-center will-change-transform">
          {chips.map((c, i) => (
            <Chip key={i} c={c} p={p} />
          ))}
          <div className="relative -mt-16 text-center sm:-mt-24">
            <div className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-gold">( Free games · No deposit )</div>
            <h2 className="font-display text-[19vw] font-black uppercase leading-[0.85] sm:text-[11vw]">
              <SplitText text="Play for" />
              <br />
              <SplitText text="free" delay={0.3} className="text-neon" />
            </h2>
          </div>
        </motion.div>
        <motion.div
          style={{ opacity: hint }}
          className="absolute bottom-8 font-mono text-[11px] uppercase tracking-[0.25em] text-muted"
        >
          Keep scrolling to take your seat ↓
        </motion.div>
      </div>
    </section>
  )
}
