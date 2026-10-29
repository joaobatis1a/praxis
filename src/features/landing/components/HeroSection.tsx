import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef, type PointerEvent } from 'react'
import { posters, videos } from '../screens'
import { CtaPill } from './CtaPill'
import { ScreenVideo } from './ScreenVideo'
import { SplitText } from './SplitText'

// Opening: the promise set in huge type, and under it the real app being
// used, lying back in perspective and standing up as the page scrolls to it.
export function HeroSection() {
  const stage = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start end', 'start 0.25'] })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 })
  // the product also leans toward the cursor, on top of the scroll tilt
  const mx = useSpring(useMotionValue(0), { stiffness: 70, damping: 18 })
  const my = useSpring(useMotionValue(0), { stiffness: 70, damping: 18 })
  const rotateX = useTransform([progress, my], ([p, m]: number[]) => (reduced ? 0 : (1 - p) * 28 - m * 6))
  const rotateY = useTransform(mx, (m) => (reduced ? 0 : m * 8))
  const scale = useTransform(progress, [0, 1], [reduced ? 1 : 0.86, 1])
  const glow = useTransform(progress, [0, 1], [0.25, 0.7])

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== 'mouse') return
    mx.set(e.clientX / window.innerWidth - 0.5)
    my.set(e.clientY / window.innerHeight - 0.5)
  }

  return (
    <section id="top" onPointerMove={onPointerMove} onPointerLeave={() => { mx.set(0); my.set(0) }} className="relative bg-[#06080d] pt-32 sm:pt-36">
      {/* a single low light behind the product; no blobs */}
      <motion.div
        aria-hidden
        style={{ opacity: glow }}
        className="pointer-events-none absolute inset-x-0 top-[30%] mx-auto h-[90vh] max-w-6xl bg-[radial-gradient(ellipse_50%_45%_at_50%_50%,rgba(37,99,235,0.42),transparent_70%)] will-change-[opacity]"
      />

      <div className="relative mx-auto max-w-[1440px] px-6 sm:px-10">
        <h1 className="font-display text-center text-white text-[clamp(3rem,10vw,10.5rem)] font-bold leading-[0.94] tracking-[-0.045em]">
          <span className="block">
            <SplitText text="O que a equipe" delay={0.15} stagger={0.03} />
          </span>
          <span className="block">
            <SplitText text="sabe, fica." delay={0.45} stagger={0.03} />
          </span>
        </h1>

        <div className="mt-10 flex flex-col items-start justify-between gap-8 sm:mt-14 sm:flex-row sm:items-end">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="max-w-sm text-[13px] font-semibold uppercase leading-relaxed tracking-[0.12em] text-white/70"
          >
            Documentos, procedimentos e avisos da sua empresa num só sistema, para que nada se perca quando alguém sai ou
            o turno troca.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.05 }}>
            <CtaPill size="lg" />
          </motion.div>
        </div>

        <div ref={stage} className="relative mt-16 pb-24 [perspective:1600px] sm:mt-20">
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.figure
              style={{ rotateX, rotateY, scale, transformOrigin: '50% 100%' }}
              className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.25rem] border border-white/15 bg-[#0b1220] p-1.5 shadow-[0_80px_160px_-40px_rgba(37,99,235,0.55),0_0_0_1px_rgba(255,255,255,0.04)] sm:rounded-[1.75rem] sm:p-2.5"
            >
              <ScreenVideo
                src={videos.tour}
                poster={posters.tour}
                label="O Praxis em uso: dashboard da empresa e navegação pela Biblioteca, Procedimentos, Avisos e Cargos"
                className="aspect-[16/10] rounded-[0.9rem] object-cover sm:rounded-[1.25rem]"
              />
              {/* the bottom of the screen dissolves into the page */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#06080d] to-transparent" />
            </motion.figure>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
