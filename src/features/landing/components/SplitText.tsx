import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '../../../lib/cn'

const EASE = [0.76, 0, 0.24, 1] as const

const charVariants: Variants = {
  hidden: { y: '115%' },
  show: (delay: number) => ({ y: '0%', transition: { duration: 0.9, ease: EASE, delay } }),
}

interface SplitTextProps {
  text: string
  /** seconds before the first character rises */
  delay?: number
  /** seconds between consecutive characters */
  stagger?: number
  /** wait for the element to scroll into view; false plays on mount */
  whenInView?: boolean
  /** hold the animation back, e.g. while the opening screen is still up */
  paused?: boolean
  className?: string
  /** classes for each character, e.g. a gradient fill that must sit on the animated glyph itself */
  charClassName?: string
}

// Characters rise out of a clipped line, one after another. Words stay whole
// (nowrap) so wrapping never splits a word in the middle.
export function SplitText({ text, delay = 0, stagger = 0.022, whenInView = false, paused = false, className, charClassName }: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })
  const reduced = useReducedMotion()
  const active = reduced || (!paused && (!whenInView || inView))

  let index = 0
  return (
    <span ref={ref} aria-label={text} className={className}>
      {text.split(' ').map((word, w) => (
        <span key={`${word}-${w}`} aria-hidden>
          {w > 0 && ' '}
          <span className="inline-block whitespace-nowrap">
          {word.split('').map((char, c) => (
              // the vertical padding gives descenders room inside the clip, the negative margin cancels it
              <span key={c} className="-my-[0.14em] inline-block overflow-hidden py-[0.14em] align-bottom">
                <motion.span
                  custom={delay + index++ * stagger}
                  variants={charVariants}
                  initial={reduced ? 'show' : 'hidden'}
                  animate={active ? 'show' : 'hidden'}
                  className={cn('inline-block will-change-transform', charClassName)}
                >
                  {char}
                </motion.span>
              </span>
            ))}
            </span>
        </span>
      ))}
    </span>
  )
}
