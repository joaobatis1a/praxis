import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef, type PointerEvent, type ReactNode } from 'react'
import { cn } from '../../../lib/cn'

interface MagneticProps {
  children: ReactNode
  /** how far the element follows the cursor, as a fraction of the offset from its centre */
  strength?: number
  className?: string
}

// Pulls its child toward the cursor while the mouse is near and springs back
// on leave. Mouse only: touch and pen pointers leave it still.
export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const box = useRef<HTMLSpanElement>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 })

  function onMove(e: PointerEvent) {
    if (e.pointerType !== 'mouse' || !box.current) return
    const rect = box.current.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }

  function release() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span
      ref={box}
      onPointerMove={onMove}
      onPointerLeave={release}
      style={{ x, y }}
      className={cn('inline-flex', className)}
    >
      {children}
    </motion.span>
  )
}
