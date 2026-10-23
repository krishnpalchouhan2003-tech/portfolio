import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'

// Floating chip that tells visitors there are games and takes them there.
// Shows once the hero intro is past.
export default function PlayFab() {
  const { scrollY } = useScroll()
  const [past, setPast] = useState(false)
  const [covered, setCovered] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setPast(y > window.innerHeight * 0.6))

  // stay out of the way on the bets intro, the games themselves and on the contact slip (it would sit on its links)
  useEffect(() => {
    const seen = new Map()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting))
        setCovered([...seen.values()].some(Boolean))
      },
      { threshold: 0.1 },
    )
    for (const id of ['bets', 'games', 'contact']) {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    }
    return () => io.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {past && !covered && (
        <motion.a
          href="#games"
          aria-label="Play the demo casino games"
          initial={{ opacity: 0, y: 40, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.6 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-5 right-4 z-40 flex items-center gap-2 sm:bottom-8 sm:right-8"
        >
          <motion.span
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-full border border-gold/50 bg-ink/90 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-gold shadow-[0_8px_24px_rgb(0_0_0/0.5)]"
          >
            Play games
          </motion.span>
          <span className="relative grid h-16 w-16 place-items-center">
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full border-2 border-gold/70 motion-reduce:hidden" />
            <motion.span
              aria-hidden
              className="chip absolute inset-0"
              style={{ '--chip': '#c8102e' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
            />
            <span className="relative z-10 font-display text-lg font-black uppercase text-white">Play</span>
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
