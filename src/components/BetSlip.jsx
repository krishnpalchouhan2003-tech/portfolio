import { useState } from 'react'
import { motion } from 'motion/react'
import { profile } from '../data'
import SplitText from './SplitText'

const YEAR = new Date().getFullYear()

// brand marks (Simple Icons) so each link is recognisable at a glance
const links = [
  {
    label: 'GitHub',
    href: profile.github,
    color: '#181717',
    icon: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  },
  {
    label: 'LinkedIn',
    href: profile.linkedin,
    color: '#0a66c2',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    label: 'Resume',
    href: profile.resume,
    color: '#c8102e',
    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 1.5L18.5 8H14zM8 12h8v1.5H8zm0 4h8v1.5H8z',
  },
]

const stakes = [
  ['Full-time', 'A teammate who ships every sprint'],
  ['Contract', 'A focused push on your hardest screen'],
  ['Freelance', 'One sharp feature, done right'],
]

export default function BetSlip() {
  const [stake, setStake] = useState(0)
  const subject = encodeURIComponent(`${stakes[stake][0]} opportunity`)

  return (
    <section id="contact" className="relative overflow-hidden px-4 py-32 sm:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <div>
          <div className="mb-6 font-mono text-xs uppercase tracking-widest text-muted">( Final whistle )</div>
          <h2 className="font-display text-7xl font-black uppercase leading-[0.85] sm:text-9xl">
            <SplitText text="Place" />
            <br />
            <SplitText text="your " delay={0.2} />
            <SplitText text="bet." delay={0.4} className="text-neon" />
          </h2>
          <p className="mt-6 max-w-md text-muted">
            Building a sportsbook, casino or anything real-time? Pick a stake on the slip and send it over. I reply
            within a day.
          </p>
        </div>

        <motion.div
          initial={{ x: 160, rotate: 6, opacity: 0 }}
          whileInView={{ x: 0, rotate: -2, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: 'spring', stiffness: 70, damping: 14 }}
          className="w-full max-w-md justify-self-center rounded-2xl bg-[#f4f1e8] text-ink shadow-[0_40px_80px_rgb(0_0_0/0.6)] lg:justify-self-end"
        >
          <div className="flex items-center justify-between rounded-t-2xl bg-ink px-5 py-3 font-mono text-xs uppercase tracking-widest text-text">
            <span>Bet slip</span>
            <span className="rounded bg-neon px-2 py-0.5 font-semibold text-ink">1 selection</span>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display text-3xl font-black uppercase leading-none">
                  Hire {profile.first} {profile.last}
                </div>
                <div className="mt-1 text-sm text-ink/60">
                  {profile.role} — {profile.domain}
                </div>
              </div>
              <div className="rounded-md bg-ink px-3 py-1 font-mono font-semibold text-gold">1.01</div>
            </div>

            <fieldset className="mt-5">
              <legend className="mb-2 font-mono text-[11px] uppercase tracking-widest text-ink/50">Stake</legend>
              <div className="grid grid-cols-3 gap-2">
                {stakes.map(([label], i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setStake(i)}
                    aria-pressed={stake === i}
                    className={`rounded-lg border px-2 py-2 text-sm font-semibold transition-all active:scale-95 ${
                      stake === i ? 'border-ink bg-ink text-neon' : 'border-ink/20 hover:border-ink'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="ticket-cut relative h-6">
            <div className="absolute inset-x-6 top-1/2 border-t-2 border-dashed border-ink/20" />
          </div>

          <div className="p-5 pt-2">
            <div className="flex justify-between font-mono text-sm">
              <span className="text-ink/60">Potential return</span>
              <span className="text-right font-semibold">{stakes[stake][1]}</span>
            </div>
            <a
              href={`mailto:${profile.email}?subject=${subject}`}
              className="mt-5 block rounded-xl bg-neon py-4 text-center font-display text-2xl font-black uppercase tracking-wide text-ink transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Place bet →
            </a>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {links.map(({ label, href, color, icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${label} (opens in a new tab)`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-ink/15 bg-white/60 py-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink transition-colors hover:border-ink/40 hover:bg-white"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill={color} aria-hidden>
                    <path d={icon} />
                  </svg>
                  {label}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="mt-32 border-t border-line pt-6 font-mono text-[11px] uppercase tracking-widest text-muted">
        <div className="flex flex-wrap justify-between gap-2">
          <span>© {YEAR} {profile.first} {profile.last}</span>
          <span>{profile.location} · Play responsibly · 18+</span>
        </div>
      </footer>
    </section>
  )
}
