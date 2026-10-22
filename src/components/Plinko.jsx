import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { PLINKO_PAYOUTS, PLINKO_ROWS, plinkoPath } from '../games'

const S = 32 // peg spacing
const CX = 160
const TOP = 24
const ROW = 28
const BUCKET_Y = TOP + PLINKO_ROWS * ROW
const pegs = Array.from({ length: PLINKO_ROWS }, (_, r) =>
  Array.from({ length: r + 3 }, (_, j) => [CX + (j - (r + 2) / 2) * S, TOP + r * ROW]),
).flat()
const tone = (x) => (x >= 3 ? '#ff3b5c' : x >= 1 ? '#f5c542' : '#7c8499')

function Ball({ path, onDone }) {
  // land on top of the peg in each row, then drop into the bucket
  const xs = [CX]
  const ys = [0]
  let k = 0
  path.forEach((step, r) => {
    xs.push(CX + (k * S) / 2)
    ys.push(TOP + r * ROW - 9)
    k += step ? 1 : -1
  })
  xs.push(CX + (k * S) / 2)
  ys.push(BUCKET_Y + 8)
  const duration = 0.17 * xs.length
  const seg = duration / (xs.length - 1)
  const move = (delay = 0) => ({
    cx: { duration, delay, ease: 'linear' },
    cy: { duration, delay, ease: Array(ys.length - 1).fill('easeIn') },
  })
  return (
    <g>
      {/* each peg the ball strikes rings out */}
      {xs.slice(1, -1).map((x, r) => (
        <motion.circle
          key={r}
          cx={x}
          cy={TOP + r * ROW}
          fill="none"
          stroke="#f5c542"
          strokeWidth="1.5"
          // first keyframe must be invisible: it is applied during the delay and would reveal the path
          initial={{ r: 3, opacity: 0 }}
          animate={{ r: [3, 4, 11], opacity: [0, 0.9, 0] }}
          transition={{ delay: seg * (r + 1), duration: 0.45, times: [0, 0.1, 1] }}
        />
      ))}
      <motion.circle r="5" fill="#f5c542" opacity="0.25" initial={{ cx: CX, cy: 0 }} animate={{ cx: xs, cy: ys }} transition={move(0.06)} />
      <motion.circle r="6" fill="#f5c542" initial={{ cx: CX, cy: 0 }} animate={{ cx: xs, cy: ys }} transition={move()} onAnimationComplete={onDone} />
    </g>
  )
}

export default function Plinko({ wallet }) {
  const { bet, take, pay, say } = wallet
  const [balls, setBalls] = useState([])
  const [pops, setPops] = useState([]) // payout labels rising out of buckets
  const nextId = useRef(0)

  const drop = () => {
    if (!take()) return
    setBalls((b) => [...b, { id: nextId.current++, path: plinkoPath(), bet }])
  }

  const land = (ball) => {
    const slot = ball.path.reduce((a, b) => a + b, 0)
    const x = PLINKO_PAYOUTS[slot]
    const win = Math.floor(ball.bet * x)
    const net = win - ball.bet
    pay(win, x)
    setBalls((b) => b.filter((o) => o.id !== ball.id))
    setPops((p) => [...p, { id: ball.id, slot, x }])
    say(`Plinko ${x}× · ${net >= 0 ? '+' : '−'}${Math.abs(net)}`)
    navigator.vibrate?.(x >= 3 ? [30, 40, 30] : 10)
  }
  const lastHit = pops.at(-1)

  return (
    <div>
      <div className="rounded-2xl border border-line bg-ink/60">
        <svg viewBox={`0 -8 320 ${BUCKET_Y + 34}`} className="block h-auto w-full" aria-hidden>
          {pegs.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#7c8499" />
          ))}
          {PLINKO_PAYOUTS.map((x, i) => {
            const flash = lastHit?.slot === i
            return (
              <motion.g
                key={flash ? `hit-${lastHit.id}` : i}
                initial={flash ? { y: 7 } : false}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 12 }}
              >
                <rect
                  x={CX + (i - 4) * S - 14}
                  y={BUCKET_Y}
                  width="28"
                  height="22"
                  rx="4"
                  fill={x >= 3 ? '#ff3b5c' : x >= 1 ? '#f5c542' : '#1c2235'}
                  stroke={flash ? '#ffffff' : 'none'}
                  strokeWidth="1.5"
                  opacity={flash ? 1 : 0.85}
                />
                <text
                  x={CX + (i - 4) * S}
                  y={BUCKET_Y + 11}
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={x >= 1 ? '#07090f' : '#e8ecf5'}
                >
                  {x}×
                </text>
              </motion.g>
            )
          })}
          {pops.map((p) => (
            <motion.g
              key={p.id}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -46, opacity: [0, 1, 0] }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              onAnimationComplete={() => setPops((ps) => ps.filter((o) => o.id !== p.id))}
            >
              <text
                x={CX + (p.slot - 4) * S}
                y={BUCKET_Y - 6}
                textAnchor="middle"
                fontFamily="Big Shoulders Display"
                fontWeight="900"
                fontSize={p.x >= 3 ? 24 : 15}
                fill={tone(p.x)}
              >
                {p.x}×
              </text>
            </motion.g>
          ))}
          {balls.map((b) => (
            <Ball key={b.id} path={b.path} onDone={() => land(b)} />
          ))}
        </svg>
      </div>
      <motion.button
        type="button"
        onClick={drop}
        whileTap={{ scale: 0.95, y: 2 }}
        className="mt-4 w-full rounded-xl bg-neon py-4 font-display text-2xl font-black uppercase tracking-wide text-ink"
      >
        Drop ball · {bet}
      </motion.button>
    </div>
  )
}
