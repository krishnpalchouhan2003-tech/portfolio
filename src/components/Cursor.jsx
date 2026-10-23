import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

// Mouse users only: touch screens and "reduce motion" keep the normal cursor
const enabled =
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
const CLICKABLE = 'a, button, [role="button"], .cursor-pointer'

// A dot that sits exactly on the pointer, and a chip ring that trails it and grows over anything clickable.
export default function Cursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 400, damping: 32, mass: 0.6 })
  const ry = useSpring(y, { stiffness: 400, damping: 32, mass: 0.6 })
  const [hover, setHover] = useState(false)
  const [down, setDown] = useState(false)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    root.classList.add('custom-cursor')
    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setShown(true)
      setHover(!!e.target.closest?.(CLICKABLE))
    }
    const leave = () => setShown(false)
    const press = () => setDown(true)
    const release = () => setDown(false)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', press)
    window.addEventListener('pointerup', release)
    root.addEventListener('pointerleave', leave)
    return () => {
      root.classList.remove('custom-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', press)
      window.removeEventListener('pointerup', release)
      root.removeEventListener('pointerleave', leave)
    }
  }, [x, y])

  if (!enabled) return null
  const fade = { opacity: shown ? 1 : 0 }
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[300] -ml-5 -mt-5 size-10 rounded-full border-2 border-dashed border-gold will-change-transform"
        style={{ x: rx, y: ry }}
        animate={{ ...fade, scale: down ? 0.7 : hover ? 1.7 : 1, rotate: hover ? 180 : 0, borderColor: hover ? '#00e701' : '#f5c542' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[300] -ml-1 -mt-1 size-2 rounded-full bg-neon will-change-transform"
        style={{ x, y }}
        animate={{ ...fade, scale: hover ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
    </>
  )
}
