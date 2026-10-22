import { motion } from 'motion/react'

// Letters flip up into place when the text scrolls into view
export default function SplitText({ text, className = '', delay = 0 }) {
  return (
    <span className={`inline-block [perspective:600px] ${className}`} aria-label={text}>
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block origin-bottom"
          initial={{ opacity: 0, y: '60%', rotateX: -90 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, delay: delay + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
        >
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </span>
  )
}
