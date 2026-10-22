import { useEffect, useState } from 'react'
import { motion, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { tickerDomain, tickerSkills } from '../data'

// Odds drift like a real feed: one random price moves every tick
function useLiveOdds(list) {
  const [odds, setOdds] = useState(() => list.map(([name, price]) => ({ name, price, dir: 0, t: 0 })))
  useEffect(() => {
    const id = setInterval(() => {
      setOdds((prev) => {
        const next = [...prev]
        const i = Math.floor(Math.random() * next.length)
        const delta = (Math.random() - 0.45) * 0.3
        next[i] = {
          ...next[i],
          price: Math.max(1.01, +(next[i].price + delta).toFixed(2)),
          dir: Math.sign(delta),
          t: Date.now(),
        }
        return next
      })
    }, 650)
    return () => clearInterval(id)
  }, [])
  return odds
}

function Row({ list, reverse, dur, skew, tone }) {
  const odds = useLiveOdds(list)
  const items = [...odds, ...odds] // duplicated for a seamless loop
  return (
    <motion.div style={{ skewX: skew }} className="overflow-hidden border-y border-line py-3 will-change-transform">
      <div className={`marquee flex w-max gap-3 ${reverse ? 'marquee-rev' : ''}`} style={{ '--dur': dur }}>
        {items.map((o, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-md border border-line bg-panel px-4 py-2 font-mono text-sm"
          >
            <span className={tone}>{o.name}</span>
            <span
              key={o.t}
              className={`rounded px-2 py-0.5 tabular-nums text-text ${o.dir > 0 ? 'flash-up' : o.dir < 0 ? 'flash-down' : ''}`}
            >
              {o.price.toFixed(2)}
            </span>
            <span className={o.dir > 0 ? 'text-neon' : o.dir < 0 ? 'text-loss' : 'text-muted'}>
              {o.dir > 0 ? '▲' : o.dir < 0 ? '▼' : '•'}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function OddsTicker() {
  // rows lean into the direction you scroll
  const { scrollY } = useScroll()
  const v = useVelocity(scrollY)
  const skew = useSpring(useTransform(v, [-2500, 2500], [10, -10]), { stiffness: 300, damping: 40 })

  return (
    <section aria-label="Skills as live markets" className="relative z-10 -mt-[1px] space-y-2 bg-ink py-10">
      <div className="mb-4 flex items-center gap-2 px-4 font-mono text-xs uppercase tracking-widest text-muted sm:px-8">
        <span className="live-dot h-2 w-2 rounded-full bg-neon" /> In-play markets · prices update live
      </div>
      <Row list={tickerSkills} dur="45s" skew={skew} tone="text-text" />
      <Row list={tickerDomain} dur="38s" reverse skew={skew} tone="text-gold" />
    </section>
  )
}
