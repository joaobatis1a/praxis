import { motion } from 'framer-motion'
import { BookOpen, ClipboardList, GraduationCap, Route } from 'lucide-react'
import { Reveal } from './Reveal'

const shifts = [
  {
    problem: 'Conhecimento perdido quando alguém sai da empresa',
    solution: 'Biblioteca de Conhecimento',
    description: 'Documentos organizados, versionados e sempre acessíveis pra quem fica.',
    icon: BookOpen,
  },
  {
    problem: 'Processos que só existem na cabeça das pessoas',
    solution: 'Procedimentos Operacionais',
    description: 'Checklists e etapas claras, com responsável e status definidos.',
    icon: ClipboardList,
  },
  {
    problem: 'Treinamentos espalhados em pastas e e-mails',
    solution: 'Treinamentos estruturados',
    description: 'Vídeos, PDFs e questionários organizados, com certificado ao final.',
    icon: GraduationCap,
  },
  {
    problem: 'Onboarding sem direção nem sequência',
    solution: 'Trilhas de Aprendizagem',
    description: 'Sequências guiadas com progresso acompanhado do início ao fim.',
    icon: Route,
  },
]

function ShiftRow({ index }: { index: number }) {
  const shift = shifts[index]

  return (
    <Reveal delay={index * 0.08} className="relative py-8">
      <p className="text-lg text-white/35 sm:text-xl">
        <span className="relative inline-block">
          {shift.problem}
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: index * 0.08 + 0.15 }}
            className="absolute inset-x-0 top-1/2 h-px origin-left bg-white/40"
          />
        </span>
      </p>
      <div className="mt-3 flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#4f7df9]/15 text-[#6d94fa]">
          <shift.icon size={18} />
        </div>
        <div>
          <p className="text-lg font-semibold text-white sm:text-xl">{shift.solution}</p>
          <p className="mt-1 text-sm text-white/50">{shift.description}</p>
        </div>
      </div>
    </Reveal>
  )
}

function TimelineVisual() {
  return (
    <div className="relative rounded-xl border border-white/10 bg-white/[0.02] px-8 py-10">
      <div className="absolute left-[3.25rem] top-10 bottom-10 w-px bg-gradient-to-b from-[#4f7df9]/60 via-white/10 to-transparent" />
      <div className="space-y-10">
        {shifts.map((shift, i) => (
          <motion.div
            key={shift.solution}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="relative flex items-center gap-4"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(79,125,249,0.45)',
                  '0 0 0 10px rgba(79,125,249,0)',
                  '0 0 0 0 rgba(79,125,249,0)',
                ],
              }}
              transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.35, ease: 'easeOut' }}
              className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#4f7df9]/50 bg-[#0b1224] text-[#6d94fa]"
            >
              <shift.icon size={18} />
            </motion.div>
            <div>
              <p className="text-base font-semibold text-white">{shift.solution}</p>
              <p className="text-sm text-white/45">{shift.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function NarrativeSection() {
  return (
    <section id="solucao" className="relative py-28">
      <div className="mx-auto max-w-[var(--container-page)] px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6d94fa]">
                De disperso a conectado
              </p>
            </Reveal>
            <div className="mt-6 divide-y divide-white/5">
              {shifts.map((_, i) => (
                <ShiftRow key={shifts[i].solution} index={i} />
              ))}
            </div>
          </div>

          <Reveal delay={0.2} className="lg:sticky lg:top-28">
            <TimelineVisual />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
