import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { cn } from '../../../lib/cn'

interface SheetProps {
  id?: string
  className?: string
  children: ReactNode
}

// A section that slides up over the one before it: while its top edge travels
// up the screen it grows to full width. Only the scale moves (the curve of its
// shoulders is fixed) so scrolling never forces a repaint of the whole sheet.
export function Sheet({ id, className, children }: SheetProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.3'] })
  const scale = useTransform(scrollYProgress, [0, 1], [reduced ? 1 : 0.9, 1])

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ scale, transformOrigin: '50% 0%' }}
      className={cn('relative -mt-12 rounded-t-[3rem]', className)}
    >
      {children}
    </motion.section>
  )
}
