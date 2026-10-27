import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

const GLYPHS = 'ABCDEFGHJKLMNPRSTUVWXYZ7$♠♥♦♣'
const STAGGER = 0.04
const SPIN = 0.45 // seconds each letter rolls before it locks

// Letters flip up into place and spin through random symbols like a slot reel before locking
export default function SplitText({ text, className = '', delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [locked, setLocked] = useState(reduce ? text.length : 0)
  const [, tick] = useState(0)

  useEffect(() => {
    if (!inView || reduce) return
    const start = performance.now()
    const id = setInterval(() => {
      const t = (performance.now() - start) / 1000 - delay - SPIN
      const n = Math.max(0, Math.min(text.length, Math.floor(t / STAGGER) + 1))
      setLocked(n)
      tick((k) => k + 1) // fresh random glyphs for letters still rolling
      if (n === text.length) clearInterval(id)
    }, 60)
    return () => clearInterval(id)
  }, [inView, reduce, delay, text.length])

  return (
    <span ref={ref} className={`inline-block [perspective:600px] ${className}`} aria-label={text}>
      {text.split('').map((ch, i) => {
        const rolling = i >= locked && ch !== ' '
        return (
          <motion.span
            key={i}
            aria-hidden
            className="relative inline-block origin-bottom"
            initial={{ opacity: 0, y: '60%', rotateX: -90 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.7, delay: delay + i * STAGGER, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* the real letter always holds the width, so rolling glyphs never shift the line */}
            <span className={rolling ? 'invisible' : ''}>{ch === ' ' ? '\u00a0' : ch}</span>
            {rolling && (
              <span className="absolute inset-0 text-center">{GLYPHS[Math.floor(Math.random() * GLYPHS.length)]}</span>
            )}
          </motion.span>
        )
      })}
    </span>
  )
}
