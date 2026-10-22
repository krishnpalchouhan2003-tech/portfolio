import { useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'motion/react'
import { CRASH_RATE, crashAt, crashPoint } from '../games'
import { Burst, FloatText } from './GameFx'

const W = 320
const H = 170
const VB = [-8, -12, W + 16, H + 20]

// points of the multiplier curve so far; the axes stretch once the round outlasts 5s / 2×
function curve(m) {
  const t = Math.log(m) / CRASH_RATE
  const span = Math.max(t, 5)
  const top = Math.max(m, 2)
  return Array.from({ length: 25 }, (_, i) => {
    const s = (t * i) / 24
    return [(s / span) * W, H - ((Math.exp(CRASH_RATE * s) - 1) / (top - 1)) * H]
  })
}
const line = (pts) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')
// where a chart point sits inside the box, for HTML effects layered on top
const place = ([x, y]) => ({ left: `${((x - VB[0]) / VB[2]) * 100}%`, top: `${((y - VB[1]) / VB[3]) * 100}%` })

export default function Crash({ wallet }) {
  const { bet, take, pay, say } = wallet
  const m = useMotionValue(1)
  const round = useRef(null)
  const [phase, setPhase] = useState('idle') // idle | live | bust
  const [cashed, setCashed] = useState(null)
  const [fx, setFx] = useState(null) // { id, kind: 'boom' | 'win', pos, text }

  useAnimationFrame(() => {
    const r = round.current
    if (!r) return
    const v = crashAt(performance.now() - r.start)
    if (v < r.point) return m.set(v)
    m.set(r.point)
    round.current = null
    setPhase('bust')
    setFx({ id: performance.now(), kind: 'boom', pos: place(curve(r.point).at(-1)) })
    if (!r.cashed) {
      say(`Crashed at ${r.point.toFixed(2)}× · −${r.bet}`)
      navigator.vibrate?.([60, 30, 90])
    }
  })

  const start = () => {
    if (!take()) return
    round.current = { start: performance.now(), point: crashPoint(), bet, cashed: null }
    m.set(1)
    setCashed(null)
    setFx(null)
    setPhase('live')
    say('Climbing… cash out before it crashes.')
  }

  const cashOut = () => {
    const r = round.current
    if (!r || r.cashed) return
    r.cashed = m.get()
    const win = Math.floor(r.bet * r.cashed)
    pay(win, r.cashed)
    setCashed(r.cashed)
    setFx({ id: performance.now(), kind: 'win', pos: place(curve(r.cashed).at(-1)), text: `+${win - r.bet}` })
    say(`Cashed out at ${r.cashed.toFixed(2)}× · +${win - r.bet}`)
    navigator.vibrate?.(20)
  }

  const d = useTransform(m, (v) => line(curve(v)))
  const area = useTransform(m, (v) => {
    const pts = curve(v)
    return `${line(pts)} L${pts.at(-1)[0].toFixed(1)} ${H} L0 ${H}Z`
  })
  const tipX = useTransform(m, (v) => curve(v).at(-1)[0])
  const tipY = useTransform(m, (v) => curve(v).at(-1)[1])
  const angle = useTransform(m, (v) => {
    const [[x0, y0], [x1, y1]] = curve(v).slice(-2)
    return x1 === x0 ? -20 : (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI
  })
  const label = useTransform(m, (v) => `${v.toFixed(2)}×`)
  const color = useTransform(m, [1, 2, 10], ['#e8ecf5', '#f5c542', '#00e701'])
  const payout = useTransform(m, (v) => `Cash out ${Math.floor((round.current?.bet ?? bet) * v)}`)
  const live = phase === 'live'
  const busted = phase === 'bust'
  const stroke = busted ? '#ff3b5c' : '#00e701'

  return (
    <div>
      <motion.div
        animate={busted ? { x: [0, -12, 10, -6, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-line bg-ink/60"
      >
        {/* star grid drifts past while the round climbs */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div
            className="marquee h-full w-[200%]"
            style={{
              '--dur': '6s',
              animationPlayState: live ? 'running' : 'paused',
              backgroundImage: 'radial-gradient(circle, rgb(255 255 255 / 0.16) 1px, transparent 1.6px)',
              backgroundSize: '22px 22px',
            }}
          />
        </div>

        <svg viewBox={VB.join(' ')} className="relative block h-auto w-full" aria-hidden>
          <defs>
            <linearGradient id="crash-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={stroke} stopOpacity="0.35" />
              <stop offset="1" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#1c2235" strokeDasharray="4 6" />
          ))}
          <motion.path d={area} fill="url(#crash-fill)" />
          <motion.path d={d} fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          {!busted && (
            <motion.g style={{ x: tipX, y: tipY, rotate: angle }}>
              <motion.polygon
                points="-6,-3.5 -18,0 -6,3.5"
                fill="#ff8a00"
                style={{ originX: 1 }}
                animate={live && !cashed ? { scaleX: [1, 1.7, 1], opacity: [1, 0.55, 1] } : { scaleX: 0.6, opacity: 0.6 }}
                transition={live ? { duration: 0.22, repeat: Infinity } : { duration: 0.2 }}
              />
              <polygon points="13,0 -7,-8 -3,0 -7,8" fill="#f5c542" />
            </motion.g>
          )}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            className="font-display text-6xl font-black tabular-nums sm:text-8xl"
            style={{ color: busted ? '#ff3b5c' : color }}
            animate={busted ? { scale: [1.25, 1] } : { scale: 1 }}
          >
            {label}
          </motion.div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted">
            {busted ? (cashed ? `Crashed · you left at ${cashed.toFixed(2)}×` : 'Crashed') : cashed ? `Cashed at ${cashed.toFixed(2)}×` : live ? 'Climbing…' : 'Place a bet'}
          </div>
        </div>

        {fx && (
          <div key={fx.id} className="pointer-events-none absolute" style={fx.pos}>
            {fx.kind === 'boom' ? (
              <Burst colors={['#ff3b5c', '#ff8a00', '#f5c542']} count={20} spread={75} size={8} />
            ) : (
              <>
                <Burst colors={['#f5c542', '#00e701']} count={12} spread={45} size={6} />
                <FloatText className="text-3xl text-gold">{fx.text}</FloatText>
              </>
            )}
          </div>
        )}
        {fx?.kind === 'boom' && (
          <motion.div
            key={`flash-${fx.id}`}
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-loss"
            initial={{ opacity: 0.35 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.div>

      {live && !cashed ? (
        <motion.button
          type="button"
          onClick={cashOut}
          initial={{ scale: 0.96 }}
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 w-full rounded-xl bg-gold py-4 font-display text-2xl font-black uppercase tracking-wide text-ink shadow-[0_0_30px_rgb(245_197_66/0.35)]"
        >
          {payout}
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={start}
          disabled={live}
          whileTap={{ scale: 0.97 }}
          className="mt-4 w-full rounded-xl bg-neon py-4 font-display text-2xl font-black uppercase tracking-wide text-ink disabled:opacity-40"
        >
          {live ? 'Waiting for crash…' : `Bet ${bet}`}
        </motion.button>
      )}
    </div>
  )
}
