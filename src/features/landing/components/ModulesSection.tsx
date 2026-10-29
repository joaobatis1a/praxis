import { AnimatePresence, motion, useInView, useMotionValue, useSpring, useTransform, useVelocity } from 'framer-motion'
import { useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { cn } from '../../../lib/cn'
import { screens } from '../screens'
import { Sheet } from './Sheet'
import { SplitText } from './SplitText'

const modules = [
  {
    title: 'Biblioteca de Conhecimento',
    text: 'Documentos em pastas e categorias, com versão, histórico e favoritos. Quem edita fica registrado.',
    image: screens.lightLibrary,
  },
  {
    title: 'Procedimentos',
    text: 'Checklists com etapas, responsável, tempo estimado e vídeo. Cada conclusão fica com data e nome.',
    image: screens.lightProcedures,
  },
  {
    title: 'Avisos',
    text: 'Recados de passagem de turno para uma pessoa ou um setor inteiro, com lido e não lido.',
    image: screens.darkNotices,
  },
  {
    title: 'Cargos e Permissões',
    text: 'Proprietário, gestor e colaborador. Ative ou desative cada módulo por cargo.',
    image: screens.lightRoles,
  },
  {
    title: 'Dashboard e Atividade',
    text: 'Progresso da equipe, procedimentos concluídos e o histórico de quem fez o quê.',
    image: screens.lightDashboard,
  },
]

// On a touch screen there is no hover, so the row crossing the middle of the
// screen plays the same part: it floods with ink and its screen comes forward.
function Row({ onEnter, children }: { onEnter: () => void; children: (active: boolean) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const centred = useInView(ref, { margin: '-49% 0px -49% 0px' })
  const touch = typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches
  return (
    <div
      ref={ref}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onEnter()}
      data-active={touch && centred ? '' : undefined}
      className="group relative -mx-4 overflow-hidden rounded-2xl px-4 sm:-mx-6 sm:px-6"
    >
      {children(touch && centred)}
    </div>
  )
}

// A white sheet that slides up over the dark opening. Each row is a module;
// hovering one floats its real screen next to the cursor.
export function ModulesSection() {
  const [hovered, setHovered] = useState<number | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 26, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 220, damping: 26, mass: 0.6 })
  // the preview leans into the direction the cursor is travelling
  const rotate = useTransform(useVelocity(sx), [-1500, 0, 1500], [-8, 0, 8], { clamp: true })

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set(e.clientX - rect.left)
    y.set(e.clientY - rect.top)
  }

  return (
    <Sheet id="modulos" className="z-10 bg-[#f4f5f7] px-6 pb-32 pt-24 text-[#0b0d12] sm:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-[clamp(3rem,11vw,10rem)] font-bold leading-[0.88] tracking-[-0.045em] text-[#0b0d12]">
            <SplitText text="Módulos" whenInView stagger={0.04} />
          </h2>
          <p className="max-w-xs pb-3 text-[13px] font-semibold uppercase leading-relaxed tracking-[0.12em] text-[#0b0d12]/55">
            Tudo o que a operação precisa lembrar, em cinco lugares que conversam entre si.
          </p>
        </div>

        <div className="relative mt-16" onPointerMove={onMove} onPointerLeave={() => setHovered(null)}>
          {modules.map((m, i) => (
            <Row key={m.title} onEnter={() => setHovered(i)}>
              {(active) => (
              <>
              {/* the dividing line draws itself in from the left as the row arrives */}
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: i * 0.06 }}
                className="absolute inset-x-4 top-0 h-px origin-left bg-[#0b0d12]/15 sm:inset-x-6"
              />
              {/* on hover the row floods with ink from the bottom up */}
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-[#0b0d12] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-y-100 group-data-[active]:scale-y-100"
              />
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
                className="relative grid grid-cols-[auto_1fr] items-start gap-x-6 gap-y-3 py-8 sm:grid-cols-[minmax(7rem,12rem)_1fr_minmax(0,24rem)] sm:items-center sm:gap-x-10 sm:py-10"
              >
                <span className="font-display text-[clamp(3rem,6vw,5.5rem)] font-bold leading-none tracking-[-0.045em] text-[#0b0d12] transition-colors duration-300 sm:group-hover:text-[#6d94fa] group-data-[active]:text-[#6d94fa]">
                  0{i + 1}
                </span>
                <h3 className="font-display text-[clamp(1.3rem,2.6vw,2.4rem)] font-bold leading-[1] tracking-[-0.025em] text-[#0b0d12] transition-[color,transform] duration-500 ease-out sm:group-hover:translate-x-3 sm:group-hover:text-white group-data-[active]:translate-x-2 group-data-[active]:text-white">
                  {m.title}
                </h3>
                <p className="col-span-2 text-base leading-relaxed text-[#0b0d12]/60 transition-colors duration-300 sm:col-span-1 sm:group-hover:text-white/65 group-data-[active]:text-white/65">
                  {m.text}
                </p>
                {/* small screens show the screen inline; it steps forward when its row is the active one */}
                <img
                  src={m.image}
                  alt=""
                  loading="lazy"
                  className={cn(
                    'col-span-2 mt-2 w-full rounded-xl border shadow-lg transition-[transform,opacity] duration-500 ease-out sm:hidden',
                    active ? 'scale-100 border-white/15 opacity-100' : 'scale-[0.94] border-[#0b0d12]/10 opacity-70',
                  )}
                />
              </motion.div>
              </>
              )}
            </Row>
          ))}
          <span aria-hidden className="block h-px bg-[#0b0d12]/15" />

          <motion.div
            aria-hidden
            style={{ x: sx, y: sy, rotate }}
            className="pointer-events-none absolute left-0 top-0 z-20 hidden sm:block"
          >
            <AnimatePresence>
              {hovered !== null && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.6, x: 32, y: '-50%' }}
                  animate={{ opacity: 1, scale: 1, x: 32, y: '-50%' }}
                  exit={{ opacity: 0, scale: 0.6, x: 32, y: '-50%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_40px_80px_-30px_rgba(11,13,18,0.5)]"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.img
                      key={hovered}
                      src={modules[hovered].image}
                      alt=""
                      initial={{ opacity: 0, scale: 1.08 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="block w-[26rem] max-w-none"
                    />
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </Sheet>
  )
}
