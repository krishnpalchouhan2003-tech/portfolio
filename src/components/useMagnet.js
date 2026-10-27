import { useMotionValue, useSpring } from 'motion/react'

// Element leans toward the mouse and springs back on leave. Touch is ignored so taps stay put.
export default function useMagnet(strength = 0.35) {
  const x = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })
  const y = useSpring(useMotionValue(0), { stiffness: 200, damping: 15 })
  return {
    style: { x, y },
    onPointerMove: (e) => {
      if (e.pointerType !== 'mouse') return
      const r = e.currentTarget.getBoundingClientRect()
      x.set((e.clientX - r.left - r.width / 2) * strength)
      y.set((e.clientY - r.top - r.height / 2) * strength)
    },
    onPointerLeave: () => {
      x.set(0)
      y.set(0)
    },
  }
}
