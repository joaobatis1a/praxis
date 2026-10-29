import { useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { cn } from '../../../lib/cn'

interface ScreenVideoProps {
  src: string
  poster: string
  label: string
  className?: string
}

// A silent recording of the real app. It only plays while on screen, and
// people who ask for less motion get the still poster instead.
export function ScreenVideo({ src, poster, label, className }: ScreenVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const inView = useInView(ref, { margin: '0px 0px -10% 0px' })
  const reduced = useReducedMotion()

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (inView && !reduced) video.play().catch(() => {})
    else video.pause()
  }, [inView, reduced])

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      aria-label={label}
      muted
      loop
      playsInline
      preload="metadata"
      className={cn('block w-full', className)}
    />
  )
}
