import { useState } from 'react'
import { motion } from 'motion/react'
import { TILES, minesMultiplier, placeMines } from '../games'
import { Burst } from './GameFx'

const COUNTS = [1, 3, 5, 10]

export default function Mines({ wallet }) {
  const { bet, take, pay, say } = wallet
  const [count, setCount] = useState(3)
  const [game, setGame] = useState(null) // { id, mines: Set, open: [], bet, over: null | 'lost' | 'won' }
  const live = game && !game.over
  const safe = game?.open.length ?? 0
  // cash-out value while playing, otherwise what the first safe pick pays
  const mult = live && safe ? minesMultiplier(game.mines.size, safe) : minesMultiplier(live ? game.mines.size : count, 1)
  // when a round ends, the rest of the board flips over in a ripple from the last pick
  const last = game?.open.at(-1) ?? 12
  const rippleDelay = (i) => 0.12 + Math.hypot((i % 5) - (last % 5), Math.floor(i / 5) - Math.floor(last / 5)) * 0.07

  const start = () => {
    if (!take()) return
    setGame({ id: performance.now(), mines: placeMines(count), open: [], bet, over: null })
    say(`${count} mine${count > 1 ? 's' : ''} hidden. Pick tiles, cash out any time.`)
  }

  const cashOut = (g) => {
    const x = minesMultiplier(g.mines.size, g.open.length)
    const win = Math.floor(g.bet * x)
    pay(win, x)
    setGame({ ...g, over: 'won' })
    say(`Cashed ${x.toFixed(2)}× · +${win - g.bet}`)
    navigator.vibrate?.(20)
  }

  const reveal = (i) => {
    if (!live || game.open.includes(i)) return
    const open = [...game.open, i]
    if (game.mines.has(i)) {
      setGame({ ...game, open, over: 'lost' })
      say(`Boom · −${game.bet}`)
      navigator.vibrate?.([100, 40, 100])
      return
    }
    if (open.length === TILES - game.mines.size) return cashOut({ ...game, open })
    setGame({ ...game, open })
    navigator.vibrate?.(8)
  }

  return (
    <div>
      <motion.div
        animate={game?.over === 'lost' ? { x: [0, -12, 10, -7, 4, 0], rotate: [0, -1, 1, 0] } : {}}
        transition={{ duration: 0.45 }}
        className={`relative grid grid-cols-5 gap-2 rounded-2xl border bg-ink/60 p-3 transition-[border-color,box-shadow] duration-500 ${
          game?.over === 'won' ? 'border-neon/60 shadow-[0_0_40px_rgb(0_231_1/0.25)]' : 'border-line'
        }`}
      >
        {Array.from({ length: TILES }, (_, i) => {
          const picked = game?.open.includes(i)
          const shown = picked || game?.over
          const mine = game?.mines.has(i)
          const delay = picked ? 0 : rippleDelay(i)
          return (
            <motion.button
              key={`${game?.id}-${i}`}
              type="button"
              onClick={() => reveal(i)}
              disabled={!live || picked}
              initial={game ? { scale: 0.6, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 20, delay: i * 0.012 }}
              whileTap={live && !picked ? { scale: 0.86 } : undefined}
              aria-label={shown ? (mine ? 'Mine' : 'Gem') : `Tile ${i + 1}`}
              style={{ transitionDelay: shown ? `${delay}s` : '0s' }}
              className={`relative grid aspect-square place-items-center rounded-lg border text-2xl transition-colors duration-300 [perspective:400px] sm:text-3xl ${
                shown ? (mine ? 'border-loss/60 bg-loss/15' : 'border-neon/40 bg-neon/10') : 'border-line bg-panel'
              } ${live && !picked ? 'cursor-pointer hover:border-muted' : ''}`}
            >
              {shown && (
                <motion.span
                  initial={{ rotateY: 90, scale: 0.4 }}
                  animate={{ rotateY: 0, scale: picked && mine ? [1.6, 1] : 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 14, delay }}
                  className={`${mine ? 'text-loss' : 'text-neon'} ${picked ? '' : 'opacity-35'}`}
                >
                  {mine ? '✹' : '◆'}
                </motion.span>
              )}
              {picked && !mine && <Burst colors={['#00e701', '#b8ffb8']} count={8} spread={30} size={4} />}
              {picked && mine && <Burst colors={['#ff3b5c', '#ff8a00', '#f5c542']} count={18} spread={70} size={7} />}
            </motion.button>
          )
        })}
        {game?.over === 'lost' && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl bg-loss"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          />
        )}
      </motion.div>

      <div className="mt-4 flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-widest">
        <div className="flex items-center gap-1">
          <span className="mr-1 text-muted">Mines</span>
          {COUNTS.map((n) => (
            <motion.button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              disabled={live}
              aria-pressed={count === n}
              whileTap={{ scale: 0.85 }}
              className={`h-8 w-8 rounded-md border transition-colors ${count === n ? 'border-loss bg-loss/15 text-loss' : 'border-line text-muted'} disabled:opacity-50`}
            >
              {n}
            </motion.button>
          ))}
        </div>
        <div className="text-right">
          <span className="text-muted">{live && safe ? 'Now' : 'Next'} </span>
          <motion.span
            key={mult.toFixed(2)}
            initial={{ scale: 1.5, color: '#00e701' }}
            animate={{ scale: 1, color: '#f5c542' }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="inline-block text-base font-semibold tabular-nums"
          >
            {mult.toFixed(2)}×
          </motion.span>
        </div>
      </div>

      {live ? (
        <motion.button
          type="button"
          onClick={() => cashOut(game)}
          disabled={safe === 0}
          animate={safe ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={safe ? { duration: 0.8, repeat: Infinity } : undefined}
          whileTap={{ scale: 0.95 }}
          className="mt-4 w-full rounded-xl bg-gold py-4 font-display text-2xl font-black uppercase tracking-wide text-ink disabled:opacity-40"
        >
          {safe === 0 ? 'Pick a tile' : `Cash out ${Math.floor(game.bet * mult)}`}
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={start}
          whileTap={{ scale: 0.97 }}
          className="mt-4 w-full rounded-xl bg-neon py-4 font-display text-2xl font-black uppercase tracking-wide text-ink"
        >
          Bet {bet}
        </motion.button>
      )}
    </div>
  )
}
