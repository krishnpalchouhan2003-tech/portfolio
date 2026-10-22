import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { profile } from '../data'

const links = [
  ['Fixtures', '#work'],
  ['Paytable', '#skills'],
  ['Wheel', '#experience'],
  ['Games', '#games'],
  ['Bet slip', '#contact'],
]

export default function Nav() {
  const { scrollYProgress } = useScroll()
  const bar = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })
  const [time, setTime] = useState(() => new Date())
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* phone menu: a market board that drops in, rows dealt one by one */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 flex touch-none flex-col justify-center gap-2 bg-ink px-4 md:hidden"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 60%, #0d3b26 0%, var(--color-ink) 70%)' }}
          >
            <div className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted">( Pick a market )</div>
            {links.map(([label, href], i) => (
              <motion.a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, x: 60, rotate: 4 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.15 + i * 0.07 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center justify-between border-b border-line py-4"
              >
                <span className="font-display text-6xl font-black uppercase leading-none">{label}</span>
                <span className="rounded-md bg-panel px-3 py-1 font-mono text-sm text-gold tabular-nums">
                  {(1.5 + i * 0.75).toFixed(2)}
                </span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div style={{ scaleX: bar }} className="relative h-[2px] origin-left bg-neon" />
      <nav className="relative flex items-center justify-between border-b border-white/5 bg-ink/55 px-4 py-4 backdrop-blur-md sm:px-8">
        <a href="#top" onClick={() => setOpen(false)} className="font-display text-2xl font-black tracking-wide text-white">
          {profile.initials}
          <span className="text-neon">.</span>
        </a>
        <ul className="hidden gap-8 font-mono text-xs uppercase tracking-widest text-white md:flex">
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="hover:text-neon transition-colors">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 font-mono text-xs text-white">
          <span className="live-dot inline-block h-2 w-2 rounded-full bg-loss" aria-hidden />
          LIVE
          <span className="tabular-nums text-white/60">
            {time.toLocaleTimeString([], { hour12: false })}
          </span>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="relative ml-2 h-10 w-10 md:hidden"
          >
            <motion.span
              animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
              className="absolute left-2 right-2 top-1/2 h-0.5 bg-white"
            />
            <motion.span
              animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
              className="absolute left-2 right-2 top-1/2 h-0.5 bg-white"
            />
          </button>
        </div>
      </nav>
    </header>
  )
}
