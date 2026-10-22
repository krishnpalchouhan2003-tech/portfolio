import { useEffect, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'

// Particles flying out from the parent's centre. Only transform/opacity, so it stays on the GPU.
export function Burst({ colors, count = 14, spread = 70, size = 7 }) {
  const [parts] = useState(() =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.5
      const d = spread * (0.5 + Math.random() * 0.6)
      return { x: Math.cos(a) * d, y: Math.sin(a) * d + spread * 0.3, c: colors[i % colors.length], r: Math.random() * 360 }
    }),
  )
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-20">
      {parts.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-sm"
          style={{ width: size, height: size, left: -size / 2, top: -size / 2, background: p.c }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4, rotate: p.r }}
          transition={{ duration: 0.85, ease: [0.2, 0.8, 0.4, 1] }}
        />
      ))}
    </div>
  )
}

// Text that pops and rises out of the parent's centre
export function FloatText({ children, className = '', onDone }) {
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display font-black ${className}`}
      initial={{ y: 0, opacity: 0, scale: 0.6 }}
      animate={{ y: -60, opacity: [0, 1, 1, 0], scale: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      onAnimationComplete={onDone}
    >
      {children}
    </motion.div>
  )
}

// Number that rolls to its new value
export function Count({ value, className }) {
  const mv = useMotionValue(value)
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString())
  useEffect(() => {
    const a = animate(mv, value, { duration: 0.6, ease: 'easeOut' })
    return () => a.stop()
  }, [mv, value])
  return <motion.span className={className}>{text}</motion.span>
}
