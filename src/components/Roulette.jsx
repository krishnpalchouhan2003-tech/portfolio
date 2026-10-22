import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import { experience } from '../data'

// European wheel order
const ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26]
const SEG = 360 / ORDER.length
const R_OUT = 200
const R_IN = 150

const polar = (r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180
  return [r * Math.cos(a), r * Math.sin(a)]
}

function pocketPath(i) {
  const a0 = i * SEG - SEG / 2
  const a1 = a0 + SEG
  const [x0, y0] = polar(R_OUT, a0)
  const [x1, y1] = polar(R_OUT, a1)
  const [x2, y2] = polar(R_IN, a1)
  const [x3, y3] = polar(R_IN, a0)
  return `M${x0} ${y0} A${R_OUT} ${R_OUT} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${R_IN} ${R_IN} 0 0 0 ${x3} ${y3}Z`
}

function Wheel({ rotate, ball }) {
  return (
    <div className="relative aspect-square w-[min(60vw,300px)] sm:w-[min(80vw,440px)]">
      <motion.svg viewBox="-210 -210 420 420" style={{ rotate }} className="h-full w-full will-change-transform" aria-hidden>
        <circle r="208" fill="#3b2412" stroke="#f5c542" strokeWidth="3" />
        {ORDER.map((n, i) => {
          const [tx, ty] = polar(175, i * SEG)
          return (
            <g key={n}>
              <path d={pocketPath(i)} fill={n === 0 ? '#0b8a3a' : i % 2 ? '#c8102e' : '#111'} stroke="#f5c54266" strokeWidth="0.8" />
              <text x={tx} y={ty} fill="#f4f1e8" fontSize="12" fontFamily="JetBrains Mono" textAnchor="middle" dominantBaseline="central" transform={`rotate(${i * SEG} ${tx} ${ty})`}>
                {n}
              </text>
            </g>
          )
        })}
        <circle r={R_IN} fill="#0e1220" />
        {Array.from({ length: 8 }, (_, i) => {
          const [x, y] = polar(R_IN - 10, i * 45)
          return <line key={i} x1="0" y1="0" x2={x} y2={y} stroke="#f5c54255" strokeWidth="2" />
        })}
        <circle r="34" fill="#f5c542" />
        <circle r="14" fill="#7a5d14" />
      </motion.svg>
      {/* ball rides the track the other way */}
      <motion.div style={{ rotate: ball }} className="pointer-events-none absolute inset-0 will-change-transform">
        <span className="absolute left-1/2 top-[14%] h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_white]" />
      </motion.div>
      <div aria-hidden className="absolute left-1/2 -top-3 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[18px] border-x-transparent border-t-gold" />
    </div>
  )
}

export default function Roulette() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const rotate = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1080]), { stiffness: 60, damping: 20 })
  const ball = useSpring(useTransform(scrollYProgress, [0, 1], [0, -1620]), { stiffness: 50, damping: 18 })
  const [active, setActive] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = Math.min(experience.length - 1, Math.floor(v * experience.length))
    if (next !== active) navigator.vibrate?.(25) // ball drops into a pocket
    setActive(next)
  })
  const job = experience[active]

  return (
    <section id="experience" ref={ref} className="relative" style={{ height: `${experience.length * 100 + 60}vh` }}>
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-6 overflow-hidden px-4 sm:px-8 lg:flex-row lg:gap-16">
        <Wheel rotate={rotate} ball={ball} />

        <div className="w-full max-w-md">
          <div className="mb-4 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
            <span>Spin history</span>
            <span className="tabular-nums">
              {String(active + 1).padStart(2, '0')} / {String(experience.length).padStart(2, '0')}
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -30, filter: 'blur(6px)' }}
              transition={{ duration: 0.4 }}
            >
              <div className="font-mono text-sm text-gold">{job.period}</div>
              <h3 className="mt-2 font-display text-4xl font-black uppercase leading-[0.9] sm:text-6xl">{job.role}</h3>
              <div className="mt-2 text-lg text-neon">{job.company}</div>
              <ul className="mt-5 space-y-2 text-muted">
                {job.points.map((pt) => (
                  <li key={pt} className="flex gap-3">
                    <span className="text-loss">◆</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex gap-2">
            {experience.map((_, i) => (
              <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= active ? 'bg-neon' : 'bg-line'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
