import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { projects } from '../data'
import SplitText from './SplitText'

function MatchCard({ p, i, total, progress }) {
  // earlier cards shrink and darken as later ones slide over them
  const start = i / total
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - i) * 0.05])
  // function form keeps Motion off its accelerated scroll-timeline path (it misreads sticky targets)
  const dim = useTransform(progress, (v) => (i === total - 1 ? 0 : Math.max(0, Math.min(1, (v - start) / (1 - start))) * 0.6))
  // while sliding in, the card is tipped back in 3D and slightly turned, then lands flat
  const span = 1 / Math.max(1, total - 1)
  const enter = useTransform(progress, [(i - 1) * span, i * span], [1, 0])
  const rotateX = useTransform(enter, [0, 1], [0, 28])
  const rotateZ = useTransform(enter, [0, 1], [0, i % 2 ? 5 : -5])

  return (
    <div className="sticky top-0 flex h-svh items-center justify-center px-4 [perspective:1400px] sm:px-8">
      <motion.article
        style={{ scale, rotateX, rotateZ, top: `${i * 28}px`, '--accent': p.accent }}
        className="relative w-full max-w-5xl origin-top will-change-transform overflow-hidden rounded-3xl border border-line bg-panel shadow-[0_-20px_60px_rgb(0_0_0/0.5)]"
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
            <ul className="mt-6 flex flex-wrap gap-2">
              {p.stack.map((s) => (
                <li key={s} className="rounded-full border border-line px-3 py-1 font-mono text-xs text-text/80">
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-4 font-mono sm:mt-8 text-xs uppercase tracking-widest">
              {p.live && (
                <a href={p.live} target="_blank" rel="noreferrer" className="rounded-md px-4 py-2 font-semibold text-ink transition-transform active:scale-95" style={{ background: p.accent }}>
                  Live ↗
                </a>
              )}
              {p.repo && (
                <a href={p.repo} target="_blank" rel="noreferrer" className="rounded-md border border-line px-4 py-2 transition-transform hover:border-text active:scale-95">
                  Code ↗
                </a>
              )}
              {!p.live && !p.repo && <span className="px-1 py-2 text-muted">Internal · private</span>}
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
                    {value}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-ink will-change-[opacity]" />
      </motion.article>
    </div>
  )
}

export default function Projects() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  return (
    <section id="work" className="relative overflow-x-clip">
      {/* clip, not hidden: tilted cards poke past the edge and widen the phone viewport, but sticky must keep working */}
      <div className="flex items-end justify-between px-4 pb-6 sm:px-8">
        <h2 className="font-display text-6xl font-black uppercase leading-none sm:text-8xl"><SplitText text="Fixtures" /></h2>
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
          {String(projects.length).padStart(2, '0')} markets open
        </span>
      </div>
      <div ref={ref}>
        {projects.map((p, i) => (
          <MatchCard key={p.code} p={p} i={i} total={projects.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  )
}
