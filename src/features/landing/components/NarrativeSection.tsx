import { motion } from 'framer-motion'
import { Bell, BookOpen, ClipboardList, Megaphone, Unlink } from 'lucide-react'
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
    problem: 'Contexto perdido na troca de turno',
    solution: 'Avisos entre a equipe',
    description: 'Deixe um recado sobre onde parou, para a pessoa certa ou o setor inteiro.',
    icon: Megaphone,
  },
  {
    problem: 'Atualizações que se perdem no meio do caminho',
    solution: 'Central de Notificações',
    description: 'Cada pessoa é avisada só do que importa pra ela, na hora certa.',
    icon: Bell,
  },
]

function ConnectorLine({ index }: { index: number }) {
  return (
    <div className="relative mx-auto h-10 w-px sm:h-px sm:w-14">
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-[#4f7df9]/50 to-[#4f7df9]/10 sm:bg-gradient-to-r" />
      <motion.div
        className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#6d94fa] shadow-[0_0_8px_2px_rgba(79,125,249,0.65)] sm:hidden"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: index * 0.35 }}
      />
      <motion.div
        className="absolute top-1/2 hidden h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#6d94fa] shadow-[0_0_8px_2px_rgba(79,125,249,0.65)] sm:block"
        animate={{ left: ['0%', '100%'] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: index * 0.35 }}
      />
    </div>
  )
}

function ShiftRow({ index }: { index: number }) {
  const shift = shifts[index]

  return (
    <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-4">
      <Reveal delay={index * 0.1} className="min-w-0">
        <div className="flex items-center gap-3 sm:justify-end">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/30">
            <Unlink size={15} />
          </div>
          <p className="relative min-w-0 text-sm text-white/35">
            <span className="relative inline-block">
              {shift.problem}
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.15 }}
                className="absolute inset-x-0 top-1/2 h-px origin-left bg-white/30"
              />
            </span>
          </p>
        </div>
      </Reveal>

      <ConnectorLine index={index} />

      <motion.div
        initial={{ opacity: 0, x: 16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.25, type: 'spring', stiffness: 260, damping: 22 }}
        className="flex min-w-0 items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#4f7df9]/15 text-[#6d94fa]">
          <shift.icon size={19} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white">{shift.solution}</p>
          <p className="mt-1 text-sm text-white/50">{shift.description}</p>
        </div>
      </motion.div>
    </div>
  )
}

export function NarrativeSection() {
  return (
    <section id="solucao" className="relative py-28">
      <div className="relative z-10 mx-auto max-w-[var(--container-page)] px-6">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6d94fa]">De disperso a conectado</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight text-white">O que hoje vive espalhado, aqui vira uma coisa só.</h2>
        </Reveal>

        <div className="mx-auto mt-16 max-w-4xl space-y-10 lg:max-w-5xl">
          {shifts.map((_, i) => (
            <ShiftRow key={shifts[i].solution} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
