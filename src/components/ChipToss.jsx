import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

const COLORS = ['#c8102e', '#1f3fbf', '#0b6e4f', '#111111', '#f5c542']

// Section break: a handful of chips is tossed across the screen each time this line crosses the middle of the viewport
export default function ChipToss() {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  const reduce = useReducedMotion()
  const [round, setRound] = useState(0)
  useEffect(() => {
    if (inView) setRound((r) => r + 1)
  }, [inView])

  return (
    <div ref={ref} aria-hidden className="pointer-events-none relative z-10 h-px">
      {round > 0 && !reduce && <Toss key={round} />}
    </div>
  )
}

function Toss() {
  const [chips] = useState(() =>
    Array.from({ length: 9 }, (_, i) => ({
      color: COLORS[i % COLORS.length],
      size: 28 + Math.random() * 36,
      dir: i % 2 ? 1 : -1, // alternate chips fly left-to-right and right-to-left
      peak: 120 + Math.random() * 220,
      land: -60 + Math.random() * 160,
      spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540),
      delay: Math.random() * 0.35,
      dur: 1.1 + Math.random() * 0.5,
    })),
  )
  return chips.map((c, i) => (
    <motion.div
      key={i}
      className="chip absolute top-0 will-change-transform"
      style={{ '--chip': c.color, width: c.size, height: c.size, left: c.dir > 0 ? -c.size : '100%' }}
      initial={{ x: 0, y: 0, rotate: 0 }}
      animate={{ x: c.dir * (window.innerWidth + c.size), y: [0, -c.peak, c.land], rotate: c.spin }}
      transition={{
        duration: c.dur,
        delay: c.delay,
        ease: 'linear',
        y: { duration: c.dur, delay: c.delay, times: [0, 0.5, 1], ease: ['easeOut', 'easeIn'] },
      }}
    />
  ))
}
