import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { highlights, manifesto } from '../data'

function Word({ children, range, progress, hot }) {
  const opacity = useTransform(progress, range, [0.12, 1])
  const y = useTransform(progress, range, [8, 0])
  return (
    <motion.span style={{ opacity, y }} className={`mr-[0.25em] inline-block ${hot ? 'text-neon' : ''}`}>
      {children}
    </motion.span>
  )
}

export default function Manifesto() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = manifesto.split(' ')

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-4 py-32 sm:px-8 sm:py-48">
      <div className="mb-10 font-mono text-xs uppercase tracking-widest text-muted">( Form guide )</div>
      <p className="font-display text-4xl font-bold uppercase leading-[1.05] sm:text-6xl lg:text-7xl">
        {words.map((w, i) => (
          <Word
            key={i}
            progress={scrollYProgress}
            range={[i / words.length, (i + 1) / words.length]}
            hot={highlights.includes(w.toLowerCase().replace(/[^a-z]/g, ''))}
          >
            {w}
          </Word>
        ))}
      </p>
    </section>
  )
}
