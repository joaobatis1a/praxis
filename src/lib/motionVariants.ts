import type { Variants } from 'framer-motion'

/** Wrap a list/grid container: `initial="hidden" animate="show"` triggers a spring-based stagger on mount or data change. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.03 } },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 340, damping: 24 },
  },
}
