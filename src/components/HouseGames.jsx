import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import SplitText from './SplitText'
import { Burst, Count, FloatText } from './GameFx'
import Crash from './Crash'
import Plinko from './Plinko'
import Mines from './Mines'

const START = 1000
const STAKES = [
  [10, '#111111'],
  [50, '#c8102e'],
  [100, '#0b6e4f'],
  [250, '#1f3fbf'],
]
const GAMES = [
  ['crash', 'Crash', Crash, '✈', 'Tap bet, watch it climb, cash out before it crashes.'],
  ['plinko', 'Plinko', Plinko, '◉', 'Drop balls. The edges pay up to 13×.'],
  ['mines', 'Mines', Mines, '◆', 'Find gems, dodge mines, cash out any time.'],
]

export default function HouseGames() {
  const [balance, setBalance] = useState(START)
  const [bet, setBet] = useState(10)
  const [tab, setTab] = useState('crash')
  const [msg, setMsg] = useState('Demo chips only. No real money, no sign-up.')
  const [wins, setWins] = useState([]) // "+chips" floating out of the balance
  const [party, setParty] = useState(null) // big-win celebration
  const fxId = useRef(0)

  // one wallet shared by every game
  const wallet = {
    bet,
    take: () => {
      if (balance < bet) {
        setMsg('Not enough chips. Hit refill.')
        return false
      }
      setBalance((b) => b - bet)
      return true
    },
    pay: (n, x = 0) => {
      setBalance((b) => b + n)
      const id = fxId.current++
      if (n > 0) setWins((w) => [...w, { id, text: `+${n.toLocaleString()}` }])
      if (x >= 5) {
        setParty({ id, x })
        navigator.vibrate?.([40, 50, 40, 50, 160])
      }
    },
    say: setMsg,
  }

  return (
    <section id="games" className="px-4 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">( House games )</div>
        <h2 className="font-display text-6xl font-black uppercase leading-none sm:text-8xl">
          <SplitText text="Play " />
          <SplitText text="a round" delay={0.15} className="text-neon" />
        </h2>
        <p className="mb-8 mt-3 font-mono text-xs uppercase tracking-widest text-gold">Free demo · No sign-up · Tap a game to start</p>

        <motion.div
          initial={{ opacity: 0, y: 70, rotateX: 14, transformPerspective: 1000 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ type: 'spring', stiffness: 70, damping: 16 }}
          className="relative rounded-3xl border border-line bg-panel p-3 sm:p-6"
        >
          {party && (
            <div key={party.id} className="pointer-events-none absolute inset-0 z-40">
              <Burst colors={['#f5c542', '#00e701', '#ff3b5c', '#7c8cff']} count={32} spread={170} size={9} />
              <FloatText className="text-5xl text-gold drop-shadow-[0_0_18px_#f5c542] sm:text-7xl" onDone={() => setParty(null)}>
                Big win {party.x.toFixed(2)}×
              </FloatText>
            </div>
          )}
          {/* big tap targets so it's obvious these are games to pick */}
          <div role="tablist" aria-label="Games" className="grid grid-cols-3 gap-2">
            {GAMES.map(([key, label, , icon]) => (
              <motion.button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                whileTap={{ scale: 0.94 }}
                className="relative flex flex-col items-center gap-1 rounded-2xl border border-line bg-ink px-2 py-3 sm:py-4"
              >
                {tab === key && (
                  <motion.span
                    layoutId="game-tab"
                    className="absolute inset-0 rounded-2xl border-2 border-neon bg-neon/10 shadow-[0_0_24px_rgb(0_231_1/0.25)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative text-2xl leading-none sm:text-3xl ${tab === key ? 'text-neon' : 'text-gold'}`}>{icon}</span>
                <span className={`relative font-display text-xl font-black uppercase sm:text-2xl ${tab === key ? 'text-text' : 'text-muted'}`}>{label}</span>
              </motion.button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted sm:inline">Stake</span>
              {STAKES.map(([v, color]) => (
                <motion.button
                  key={v}
                  type="button"
                  onClick={() => setBet(v)}
                  aria-pressed={bet === v}
                  aria-label={`Stake ${v}`}
                  animate={{ y: bet === v ? -5 : 0 }}
                  whileTap={{ scale: 0.9 }}
                  className="chip relative grid h-10 w-10 shrink-0 place-items-center"
                  style={{ '--chip': color, boxShadow: bet === v ? '0 0 0 2px #00e701, 0 8px 16px rgb(0 0 0 / 0.5)' : '0 6px 12px rgb(0 0 0 / 0.5)' }}
                >
                  <span className="relative z-10 font-mono text-[10px] font-semibold text-white">{v}</span>
                </motion.button>
              ))}
            </div>
            <div className="relative text-right font-mono">
              <div className="text-[10px] uppercase tracking-widest text-muted">Balance</div>
              <Count value={balance} className="block text-lg font-semibold tabular-nums text-gold" />
              {wins.map((w) => (
                <FloatText key={w.id} className="font-mono text-base text-neon" onDone={() => setWins((ws) => ws.filter((o) => o.id !== w.id))}>
                  {w.text}
                </FloatText>
              ))}
              {balance < START && (
                <button
                  type="button"
                  onClick={() => {
                    setBalance(START)
                    setMsg('Refilled. Good luck.')
                  }}
                  className="text-[10px] uppercase tracking-widest text-muted underline underline-offset-4"
                >
                  Refill
                </button>
              )}
            </div>
          </div>

          <motion.p
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-center text-sm text-text/80"
          >
            {GAMES.find(([key]) => key === tab)[4]}
          </motion.p>

          {/* every game stays mounted so a live round survives a tab switch */}
          <div className="mt-3">
            {GAMES.map(([key, , Game]) => (
              <motion.div
                key={key}
                role="tabpanel"
                hidden={tab !== key}
                initial={false}
                animate={tab === key ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Game wallet={wallet} />
              </motion.div>
            ))}
          </div>

          <p aria-live="polite" className="mt-4 min-h-5 text-center font-mono text-xs text-muted">
            {msg}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
