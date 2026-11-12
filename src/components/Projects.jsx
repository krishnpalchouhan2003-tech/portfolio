import { useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { projects } from '../data'
import SplitText from './SplitText'
import { Digits } from './GameFx'
import useMagnet from './useMagnet'

const clamp = (v) => Math.max(0, Math.min(1, v))
const REST = 0.35 // share of each card's scroll spent resting on the stack before the next one moves

function MatchCard({ p, i, total, progress }) {
  const span = 1 / Math.max(1, total - 1)
  // function form keeps Motion off its accelerated scroll-timeline path (it misreads sticky targets)
  // 1 = below the screen, 0 = landed on the stack; the first card starts landed
  const enter = useTransform(progress, (v) => (i === 0 ? 0 : clamp(1 - (v - (i - 1 + REST) * span) / ((1 - REST) * span))))
  // how many cards have landed on top of this one: each pushes it back and darkens it
  const covered = useTransform(progress, (v) => Math.max(0, (v - (i + REST) * span) / ((1 - REST) * span)))
  const y = useTransform(enter, (e) => e * window.innerHeight)
  const scale = useTransform(covered, (c) => 1 - c * 0.04)
  const dim = useTransform(covered, (c) => Math.min(1, c) * 0.6)
  // while sliding in, the card is tipped back in 3D and slightly turned, then lands flat
  const rotateX = useTransform(enter, [0, 1], [0, 28])
  const rotateZ = useTransform(enter, [0, 1], [0, i % 2 ? 5 : -5])
  // mouse tilt on top of the scroll tilt, with a sheen that follows the pointer (-0.5..0.5 across the card)
  const px = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 })
  const py = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 })
  const hover = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 })
  const tiltX = useTransform([rotateX, py], ([a, b]) => a - b * 8)
  const rotateY = useTransform(px, (v) => v * 10)
  const sx = useTransform(px, (v) => (v + 0.5) * 100)
  const sy = useTransform(py, (v) => (v + 0.5) * 100)
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${sx}% ${sy}%, rgb(255 255 255 / 0.07), transparent 65%)`
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
    hover.set(1)
  }
  const onLeave = () => {
    px.set(0)
    py.set(0)
    hover.set(0)
  }
  const liveMagnet = useMagnet()
  const codeMagnet = useMagnet()

  return (
      <motion.article
        style={{ y, scale, rotateX: tiltX, rotateY, rotateZ, top: `calc(var(--peek) * ${i})`, '--accent': p.accent }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="absolute inset-x-0 mx-auto w-full max-w-5xl origin-top will-change-transform overflow-hidden rounded-3xl border border-line bg-panel shadow-[0_-20px_60px_rgb(0_0_0/0.5)]"
      >
        {/* scoreboard header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-[11px] uppercase tracking-widest sm:px-8">
          <div className="flex items-center gap-3">
            <span className="live-dot h-2 w-2 rounded-full" style={{ background: p.accent }} />
            <span style={{ color: p.accent }}>{p.league}</span>
            <span className="text-muted">· {p.year}</span>
          </div>
          <span className="text-muted">
            <span className="hidden min-[400px]:inline">{p.code} · </span>{String(i + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </span>
        </div>

        <div className="grid gap-6 p-5 sm:gap-8 sm:p-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h3 className="font-display text-4xl font-black uppercase leading-[0.9] sm:text-7xl">{p.title}</h3>
            <p className="mt-4 max-w-xl text-sm text-muted sm:mt-5 sm:text-base">{p.blurb}</p>
            <ul className="mt-6 flex flex-wrap gap-2 [@media(max-height:700px)]:hidden">
              {p.stack.map((s) => (
                <li key={s} className="rounded-full border border-line px-3 py-1 font-mono text-xs text-text/80">
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-4 font-mono sm:mt-8 text-xs uppercase tracking-widest">
              {p.live && (
                <motion.a {...liveMagnet} whileTap={{ scale: 0.95 }} href={p.live} target="_blank" rel="noreferrer" className="rounded-md px-4 py-2 font-semibold text-ink" style={{ ...liveMagnet.style, background: p.accent }}>
                  Live ↗
                </motion.a>
              )}
              {p.repo && (
                <motion.a {...codeMagnet} whileTap={{ scale: 0.95 }} href={p.repo} target="_blank" rel="noreferrer" className="rounded-md border border-line px-4 py-2 transition-colors hover:border-text">
                  Code ↗
                </motion.a>
              )}
              {!p.live && !p.repo && <span className="px-1 py-2 text-muted">Private · under NDA</span>}
            </div>
          </div>

          {/* results shown as odds buttons */}
          <div className="self-end">
            <div className="mb-3 hidden font-mono text-[11px] uppercase tracking-widest text-muted md:block">Match result</div>
            <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
              {p.markets.map(([label, value], k) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 24, scale: 0.85 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 + k * 0.1 }}
                  whileTap={{ scale: 0.94 }}
                  className="flex flex-col-reverse items-start justify-between gap-1 rounded-lg border border-line bg-ink/60 px-3 py-2 transition-colors hover:border-[var(--accent)] md:flex-row md:items-center md:px-4 md:py-3"
                >
                  <span className="text-[11px] leading-tight text-muted md:text-sm">{label}</span>
                  <span className="font-mono text-lg font-semibold tabular-nums" style={{ color: p.accent }}>
                    <Digits value={value} />
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <motion.div aria-hidden style={{ background: sheen, opacity: hover }} className="pointer-events-none absolute inset-0" />
        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-ink will-change-[opacity]" />
      </motion.article>
  )
}

export default function Projects() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  return (
    // tall track; the heading and the card stack stay pinned while cards land one by one
    <section id="work" ref={ref} className="relative" style={{ height: `${projects.length * 70 + 30}svh` }}>
      <div className="sticky top-0 flex h-svh flex-col overflow-x-clip px-4 pt-20 sm:px-8 sm:pt-24">
        {/* clip, not hidden: tilted cards poke past the edge and widen the phone viewport */}
        <div className="flex items-end justify-between pb-4 sm:pb-6">
          <h2 className="font-display text-6xl font-black uppercase leading-none sm:text-8xl"><SplitText text="Fixtures" /></h2>
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            {String(projects.length).padStart(2, '0')} markets open
          </span>
        </div>
        <div className="relative flex-1 [--peek:14px] [perspective:1400px] sm:[--peek:24px]">
          {projects.map((p, i) => (
            <MatchCard key={p.code} p={p} i={i} total={projects.length} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  )
}
