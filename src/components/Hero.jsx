import { useEffect, useRef } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { profile } from '../data'
import { INTRO_DELAY } from './Intro'

const chips = [
  { color: '#c8102e', size: 120, left: '8%', top: '18%', speed: 900, spin: 220 },
  { color: '#0b6e4f', size: 80, left: '82%', top: '14%', speed: 600, spin: -160 },
  { color: '#1f3fbf', size: 150, left: '76%', top: '68%', speed: 1200, spin: 300 },
  { color: '#111111', size: 64, left: '18%', top: '74%', speed: 450, spin: -260 },
  { color: '#c8102e', size: 48, left: '50%', top: '86%', speed: 1500, spin: 400 },
]

function Chip({ c, progress }) {
  const y = useTransform(progress, [0, 1], [0, -c.speed])
  const rotate = useTransform(progress, [0, 1], [0, c.spin])
  return (
    <motion.div
      aria-hidden
      className="chip absolute will-change-transform"
      style={{ '--chip': c.color, width: c.size, height: c.size, left: c.left, top: c.top, y, rotate }}
    />
  )
}

function Letters({ text, delay = 0 }) {
  return text.split('').map((ch, i) => (
    <span key={i} className="inline-block overflow-hidden align-bottom">
      <motion.span
        className="inline-block"
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay: INTRO_DELAY + delay + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        {ch}
      </motion.span>
    </span>
  ))
}

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  // Scroll: card flips over and the name splits apart
  const flip = useSpring(useTransform(scrollYProgress, [0.1, 0.7], [0, 180]), { stiffness: 90, damping: 20 })
  const cardScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.8])
  const leftX = useTransform(scrollYProgress, [0, 1], ['0vw', '-40vw'])
  const rightX = useTransform(scrollYProgress, [0, 1], ['0vw', '40vw'])
  const bigY = useTransform(scrollYProgress, [0, 1], ['0%', '-35%'])
  // function form on purpose: Motion's accelerated ViewTimeline path left this stuck at opacity 0
  const fade = useTransform(scrollYProgress, (v) => Math.max(0, 1 - v / 0.35))

  // Mouse: tilt + holographic sheen
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [14, -14]), { stiffness: 150, damping: 15 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-16, 16]), { stiffness: 150, damping: 15 })
  const rotateY = useTransform([flip, ry], ([f, r]) => f + r)
  // foil and glare slide as layers (transforms) instead of repainting gradients every frame
  const foilX = useTransform(mx, [-0.5, 0.5], ['0%', '-60%'])
  const foilY = useTransform(my, [-0.5, 0.5], ['0%', '-60%'])
  const glareX = useTransform(mx, [-0.5, 0.5], ['0%', '50%'])
  const glareY = useTransform(my, [-0.5, 0.5], ['0%', '50%'])

  const spin = useMotionValue(0)

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = (e) => e.pointerType === 'mouse' && (mx.set(0), my.set(0))

  // Touch screens: foil drifts on its own, then follows the gyroscope once it reports
  useEffect(() => {
    if (!window.matchMedia('(hover: none)').matches) return
    const a = animate(mx, [-0.4, 0.4, -0.4], { duration: 6, repeat: Infinity, ease: 'easeInOut' })
    const b = animate(my, [0.3, -0.3, 0.3], { duration: 4.5, repeat: Infinity, ease: 'easeInOut' })
    const clamp = (v) => Math.max(-0.5, Math.min(0.5, v))
    const onTilt = (e) => {
      if (e.gamma == null) return
      a.stop()
      b.stop()
      mx.set(clamp(e.gamma / 50))
      my.set(clamp((e.beta - 45) / 50))
    }
    window.addEventListener('deviceorientation', onTilt)
    return () => {
      a.stop()
      b.stop()
      window.removeEventListener('deviceorientation', onTilt)
    }
  }, [mx, my])

  // Tap: dealer-style spin, and ask iOS for gyroscope access (needs a user tap)
  const onCardTap = () => {
    animate(spin, spin.get() + 360, { type: 'spring', stiffness: 60, damping: 12 })
    navigator.vibrate?.(15)
    const DOE = window.DeviceOrientationEvent
    if (typeof DOE?.requestPermission === 'function') DOE.requestPermission().catch(() => {})
  }

  return (
    <section id="top" ref={ref} className="relative h-[230vh]">
      <div
        className="sticky top-0 flex h-svh items-center justify-center overflow-hidden"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {/* felt-table glow */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 55%, #0d3b26 0%, transparent 70%)' }}
        />

        {/* layer 1: huge outlined backdrop word, slowest */}
        <motion.div
          aria-hidden
          style={{ y: bigY }}
          className="text-outline pointer-events-none absolute select-none will-change-transform font-display text-[38vw] font-black leading-none"
        >
          ALL IN
        </motion.div>

        {/* layer 2: chips at different depths */}
        {chips.map((c, i) => (
          <Chip key={i} c={c} progress={scrollYProgress} />
        ))}

        {/* layer 3: split name behind the card */}
        {/* font size comes from name length so any name fits: stacked on mobile, split around the card on desktop */}
        <h1
          style={{
            '--fs-mob': `min(30vw, 13svh, calc(90vw / ${Math.max(profile.first.length, profile.last.length) * 0.5}))`,
            '--fs-desk': `min(15vw, calc((88vw - 300px) / ${(profile.first.length + profile.last.length) * 0.5}))`,
          }}
          className="pointer-events-none absolute inset-x-0 top-[11%] bottom-[19%] flex flex-col items-center justify-between whitespace-nowrap font-display text-[length:var(--fs-mob)] font-black leading-none tracking-tight lg:inset-y-0 lg:flex-row lg:items-center lg:justify-center lg:gap-[calc(300px+8vw)] lg:text-[length:var(--fs-desk)]"
        >
          <motion.span style={{ x: leftX }} className="block will-change-transform">
            <Letters text={profile.first} />
          </motion.span>
          <motion.span style={{ x: rightX }} className="block text-neon will-change-transform">
            <Letters text={profile.last} delay={0.25} />
          </motion.span>
        </h1>

        {/* layer 4: the card */}
        <motion.div
          initial={{ y: 120, opacity: 0, rotateZ: -12 }}
          animate={{ y: 0, opacity: 1, rotateZ: -4 }}
          transition={{ duration: 1.2, delay: INTRO_DELAY + 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: 1200 }}
          className="relative z-10"
        >
          <motion.div
            style={{ rotateX: rx, rotateY, rotateZ: spin, scale: cardScale, transformStyle: 'preserve-3d' }}
            onTap={onCardTap}
            className="relative aspect-[5/7] w-[min(50vw,26svh,300px)] lg:w-[300px]"
          >
            {/* front */}
            {/* sizes in cqw (% of card width) so the card looks the same at every screen size */}
            <div className="card-face @container border border-white/15 bg-[#f4f1e8] text-ink shadow-[0_40px_80px_rgb(0_0_0/0.6)]">
              <div className="absolute left-[5cqw] top-[4cqw] text-center font-display leading-none text-[#c8102e]">
                <div className="text-[12cqw] font-black">A</div>
                <div className="text-[8cqw]">♥</div>
              </div>
              <div className="absolute bottom-[4cqw] right-[5cqw] rotate-180 text-center font-display leading-none text-[#c8102e]">
                <div className="text-[12cqw] font-black">A</div>
                <div className="text-[8cqw]">♥</div>
              </div>
              <div className="flex h-full flex-col items-center justify-center gap-[3cqw] px-[14cqw] text-center">
                <div className="text-[22cqw] leading-none text-[#c8102e]">♥</div>
                <div className="font-display text-[11cqw] font-black uppercase leading-none">
                  {profile.first} {profile.last}
                </div>
                <div className="font-mono text-[5.4cqw] font-semibold uppercase leading-snug tracking-[0.04em] text-[#c8102e]">
                  {profile.role} · {profile.domain}
                </div>
              </div>
              {/* holo foil + glare follow the pointer */}
              <motion.div
                aria-hidden
                className="absolute left-0 top-0 h-[250%] w-[250%] mix-blend-color-dodge opacity-60 will-change-transform"
                style={{
                  backgroundImage:
                    'linear-gradient(115deg, transparent 20%, #ff3b5c55 30%, #f5c54255 40%, #00e70155 50%, #7c8cff55 60%, transparent 70%)',
                  x: foilX,
                  y: foilY,
                }}
              />
              <motion.div
                aria-hidden
                className="absolute -left-full -top-full h-[200%] w-[200%] will-change-transform"
                style={{ background: 'radial-gradient(circle, rgb(255 255 255 / 0.35), transparent 30%)', x: glareX, y: glareY }}
              />
            </div>

            {/* back: black VIP card, gold sheen follows the same tilt as the front */}
            <div className="card-face card-back-pattern @container border border-gold/40" style={{ transform: 'rotateY(180deg)' }}>
              <div className="absolute inset-[5cqw] flex flex-col items-center justify-center rounded-[3cqw] border border-gold/45 text-center">
                <div className="font-mono text-[5cqw] tracking-[0.4em] text-gold/80">♠ ♥ ♣ ♦</div>
                <div className="mt-[4cqw] bg-gradient-to-b from-[#fbe7a1] via-gold to-[#9c7413] bg-clip-text font-display text-[30cqw] font-black leading-none text-transparent">
                  {profile.initials}
                </div>
                <div className="mt-[3cqw] flex items-center gap-[3cqw] font-mono text-[4.5cqw] uppercase tracking-[0.3em] text-gold">
                  <span className="h-px w-[8cqw] bg-gold/60" />
                  VIP
                  <span className="h-px w-[8cqw] bg-gold/60" />
                </div>
                <div className="absolute bottom-[5cqw] font-mono text-[3.6cqw] uppercase tracking-[0.25em] text-muted">High roller · Since 2025</div>
              </div>
              <motion.div
                aria-hidden
                className="absolute left-0 top-0 h-[250%] w-[250%] mix-blend-overlay will-change-transform"
                style={{
                  backgroundImage: 'linear-gradient(115deg, transparent 35%, #f5c54266 45%, #fff3 50%, #f5c54266 55%, transparent 65%)',
                  x: foilX,
                  y: foilY,
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* HUD */}
        <motion.div
          style={{ opacity: fade }}
          className="absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-6 font-mono text-[11px] uppercase tracking-widest text-muted sm:px-8"
        >
          <div>
            <div className="text-text">{profile.role}</div>
            <div>{profile.domain}</div>
          </div>
          {/* touch hint (inside the HUD so one element owns the scroll-linked fade) */}
          <div className="absolute inset-x-0 bottom-16 hidden text-center text-[10px] tracking-[0.25em] text-gold/80 pointer-coarse:block">
            Tap the card · tilt your phone
          </div>
          <div className="hidden text-center sm:block">
            <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
              ↓
            </motion.div>
            Scroll to deal
          </div>
          <div className="text-right">
            <div className="font-display text-4xl font-black text-gold">{profile.years}</div>
            Years in iGaming
          </div>
        </motion.div>
      </div>
    </section>
  )
}
