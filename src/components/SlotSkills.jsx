import { useRef, useState } from 'react'
import { motion, useInView, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { reels } from '../data'
import SplitText from './SplitText'
import { Burst } from './GameFx'

const H = 88 // px height of one reel row

function Reel({ reel, progress, spins, stopAt }) {
  const strip = Array.from({ length: spins + 1 }, () => reel.items).flat()
  const target = spins * reel.items.length + reel.final
  // centre row is the payline, so the top row is target - 1
  const raw = useTransform(progress, [0.05, stopAt], [0, -(target - 1) * H], { clamp: true })
  const y = useSpring(raw, { stiffness: 140, damping: 18 })

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl bg-[#f4f1e8]" style={{ height: H * 3 }}>
      <motion.ul style={{ y }} className="will-change-transform">
        {strip.map((s, i) => (
          <li
            key={i}
            className="flex items-center justify-center font-display text-lg font-black uppercase text-ink min-[400px]:text-xl sm:text-4xl"
            style={{ height: H }}
          >
            {s}
          </li>
        ))}
      </motion.ul>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(#000a,transparent_30%,transparent_70%,#000a)]" />
    </div>
  )
}

export default function SlotSkills() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const lever = useTransform(scrollYProgress, [0, 0.08, 0.16], [0, 50, 0])
  const [jackpot, setJackpot] = useState(false)
  const [hits, setHits] = useState(0) // bumps on each new jackpot so the coin burst replays
  const inView = useInView(ref)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const hit = v > 0.82
    if (hit && !jackpot) {
      navigator.vibrate?.([40, 60, 40, 60, 120])
      setHits((h) => h + 1)
    }
    setJackpot(hit)
  })

  return (
    <section id="skills" ref={ref} className={`relative h-[320vh] ${inView ? '' : 'paused'}`}>
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-8 px-4 sm:px-8">
        <div className="text-center">
          <h2 className="font-display text-6xl font-black uppercase leading-none sm:text-8xl"><SplitText text="Paytable" /></h2>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted">Keep scrolling to spin</p>
        </div>

        <div className="flex w-full max-w-4xl items-center gap-3">
          {/* cabinet */}
          <div className={`relative min-w-0 flex-1 rounded-3xl border-4 border-gold/70 bg-gradient-to-b from-[#2a0a12] to-[#12040a] p-3 shadow-[0_0_60px_rgb(245_197_66/0.15)] sm:p-6 ${jackpot ? 'jackpot' : ''}`}>
            <div aria-hidden className="mb-4 flex justify-between px-2">
              {Array.from({ length: 14 }, (_, i) => (
                <span key={i} className="bulb h-2.5 w-2.5 rounded-full" />
              ))}
            </div>
            <div className="relative flex gap-2 overflow-hidden sm:gap-3">
              {reels.map((r, i) => (
                <Reel key={r.label} reel={r} progress={scrollYProgress} spins={3 + i} stopAt={0.6 + i * 0.1} />
              ))}
              {/* payline */}
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 bg-loss/80 shadow-[0_0_12px_#ff3b5c]" />
              {jackpot && (
                <motion.div
                  key={hits}
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                  initial={{ x: '-150%' }}
                  animate={{ x: '400%' }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                />
              )}
            </div>
            {jackpot && <Burst key={hits} colors={['#f5c542', '#ffd97a', '#fff3c4', '#00e701']} count={30} spread={190} size={9} />}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono text-[10px] uppercase tracking-widest text-gold/70 sm:gap-3">
              {reels.map((r) => (
                <span key={r.label}>{r.label}</span>
              ))}
            </div>
          </div>

          {/* lever */}
          <div aria-hidden className="relative hidden h-56 w-6 sm:block">
            <motion.div style={{ rotate: lever }} className="absolute bottom-6 left-1/2 h-44 w-1.5 -translate-x-1/2 origin-bottom rounded will-change-transform bg-gradient-to-b from-zinc-300 to-zinc-600">
              <div className="absolute -left-3 -top-5 h-7 w-7 rounded-full bg-loss shadow-[0_0_20px_#ff3b5c]" />
            </motion.div>
            <div className="absolute bottom-0 left-1/2 h-8 w-6 -translate-x-1/2 rounded bg-zinc-700" />
          </div>
        </div>

        <motion.div
          animate={{ opacity: jackpot ? 1 : 0, scale: jackpot ? 1 : 0.8 }}
          className="font-display text-2xl font-black uppercase tracking-wider text-gold drop-shadow-[0_0_18px_#f5c542] sm:text-5xl"
          aria-live="polite"
        >
          {jackpot ? 'Jackpot — frontend stack hit' : ' '}
        </motion.div>

        {/* plain list so every skill is readable without spinning */}
        <dl className="hidden w-full sm:grid max-w-4xl grid-cols-3 gap-4 font-mono text-[11px] text-muted">
          {reels.map((r) => (
            <div key={r.label}>
              <dt className="mb-1 uppercase tracking-widest text-text">{r.label}</dt>
              <dd>{r.items.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
