import { motion, useScroll, useTransform } from 'framer-motion'
import { Check } from 'lucide-react'
import { useRef, type CSSProperties } from 'react'
import { posters, videos } from '../screens'
import { Reveal } from './Reveal'
import { ScreenVideo } from './ScreenVideo'
import { Sheet } from './Sheet'
import { SplitText } from './SplitText'

interface Chapter {
  tag: string
  title: string
  points: string[]
  video: string
  poster: string
  label: string
}

const chapters: Chapter[] = [
  {
    tag: 'Biblioteca',
    title: 'Cada documento tem dono, versão e histórico.',
    points: ['Pastas no jeito que a empresa pensa', 'Busca por título e conteúdo', 'Toda edição vira uma nova versão'],
    video: videos.library,
    poster: posters.library,
    label: 'Biblioteca do Praxis: filtrando por pasta, buscando um documento e abrindo o histórico de versões',
  },
  {
    tag: 'Procedimentos',
    title: 'O passo a passo que qualquer pessoa consegue seguir.',
    points: ['Etapas marcadas uma a uma', 'Responsável e tempo estimado', 'Conclusão registrada com data'],
    video: videos.procedure,
    poster: posters.procedure,
    label: 'Procedimento no Praxis: marcando as etapas do checklist e concluindo o procedimento',
  },
  {
    tag: 'Avisos',
    title: 'O contexto passa de um turno para o outro.',
    points: ['Para uma pessoa ou um setor', 'Ligado ao procedimento certo', 'Lido e não lido, sem ruído'],
    video: videos.notices,
    poster: posters.notices,
    label: 'Avisos no Praxis: escrevendo onde parou, escolhendo o destinatário e enviando',
  },
  {
    tag: 'Cargos',
    title: 'Cada pessoa vê exatamente o que precisa.',
    points: ['Proprietário, gestor e colaborador', 'Módulos ligados ou desligados por cargo', 'Mudança vale na hora'],
    video: videos.roles,
    poster: posters.roles,
    label: 'Cargos e Permissões no Praxis: desligando módulos para o cargo de colaborador',
  },
]

function ChapterCard({ chapter, index, total }: { chapter: Chapter; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null)
  // as the next card slides over this one, it settles back and dims a little
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const last = index === total - 1
  const scale = useTransform(scrollYProgress, [0, 1], [1, last ? 1 : 0.92])
  const dim = useTransform(scrollYProgress, [0, 1], [0, last ? 0 : 0.55])

  return (
    <div
      ref={ref}
      className="sticky top-[calc(4.5rem+var(--i)*0.75rem)] h-[calc(100svh-5.5rem)] last:h-auto lg:top-[calc(6rem+var(--i)*1.25rem)] lg:h-[calc(100vh-7rem)] lg:last:h-auto"
      style={{ '--i': index } as CSSProperties}
    >
      <motion.article
        style={{ scale, transformOrigin: '50% 0%' }}
        className="relative grid items-center gap-5 overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#0d111b] p-5 shadow-[0_-30px_60px_-30px_rgba(0,0,0,0.9)] sm:gap-8 sm:rounded-[2rem] sm:p-8 lg:grid-cols-[0.8fr_1.6fr] lg:gap-10"
      >
        <div className="lg:pl-2">
          <div className="flex items-end gap-4 lg:block">
            <span className="font-display text-white text-[clamp(2.6rem,6vw,5.5rem)] font-bold leading-[0.8] tracking-[-0.045em]">
              0{index + 1}
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8fb0ff] lg:mt-6">{chapter.tag}</p>
          </div>
          <h3 className="mt-3 font-display text-[clamp(1.5rem,2.4vw,2.2rem)] font-bold leading-[1.08] tracking-[-0.025em] text-white">
            {chapter.title}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-white/65 sm:mt-6 sm:space-y-2.5">
            {chapter.points.map((p) => (
              <li key={p} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/20 text-[#8fb0ff]">
                  <Check size={12} strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-[0_30px_80px_-30px_rgba(37,99,235,0.45)]">
          <ScreenVideo src={chapter.video} poster={chapter.poster} label={chapter.label} className="aspect-[5/4] object-cover object-[62%_35%] sm:aspect-[16/10] sm:object-center" />
        </div>

        <motion.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-[#06080d]" />
      </motion.article>
    </div>
  )
}

// A dark sheet that rises over the light one. Four chapters of the product,
// each a card with a recording of the real app, that sticks and gets covered
// by the next as the page scrolls.
export function InsideSection() {
  return (
    <Sheet id="por-dentro" className="z-20 bg-[#06080d] px-4 pb-24 pt-24 sm:px-10">
      <div className="mx-auto max-w-[1440px]">
        <Reveal className="text-center">
          <h2 className="font-display text-[clamp(3rem,10vw,9rem)] font-bold leading-[0.92] tracking-[-0.045em] text-white">
            <SplitText text="Por dentro" whenInView stagger={0.04} />
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[13px] font-semibold uppercase leading-relaxed tracking-[0.12em] text-white/55">
            O Praxis de verdade, sendo usado. Sem montagem.
          </p>
        </Reveal>

        <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
          {chapters.map((c, i) => (
            <ChapterCard key={c.tag} chapter={c} index={i} total={chapters.length} />
          ))}
        </div>
      </div>
    </Sheet>
  )
}
