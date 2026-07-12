import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Reveal } from './Reveal'

const steps = [
  {
    number: '01',
    title: 'Centralize seus documentos',
    description: 'Importe e organize toda a documentação da empresa em categorias e pastas.',
  },
  {
    number: '02',
    title: 'Crie procedimentos e avise a equipe',
    description: 'Monte checklists e SOPs com vídeo a partir do conteúdo já centralizado, e deixe avisos de passagem de turno.',
  },
  {
    number: '03',
    title: 'Acompanhe quem fez o quê',
    description: 'Veja os procedimentos concluídos por cada colaborador e receba notificações do que importa pra você.',
  },
]

function StepsMock() {
  return (
    <div className="animate-float-sm rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <p className="text-sm font-medium text-white/70">Progresso de implantação</p>
      <div className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: i * 0.15 }}
            className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.3, delay: i * 0.15 + 0.25, type: 'spring', stiffness: 300 }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4ade80] text-[#052e16]"
            >
              <Check size={14} strokeWidth={3} />
            </motion.div>
            <span className="text-sm text-white/75">{step.title}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-[#4f7df9]/10 p-3">
        <p className="text-xs text-white/50">Tempo médio até o primeiro procedimento publicado</p>
        <p className="mt-1 text-2xl font-bold text-white">2 dias</p>
      </div>
    </div>
  )
}

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="relative py-28">
      <div className="mx-auto max-w-[var(--container-page)] px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="min-w-0">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6d94fa]">Em três passos</p>
              <h2 className="mt-3 text-4xl font-bold leading-tight text-white">
                Do documento perdido à equipe alinhada.
              </h2>
            </Reveal>

            <div className="mt-10 space-y-8">
              {steps.map((step, i) => (
                <div key={step.number} className="flex gap-5">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, delay: i * 0.12, type: 'spring', stiffness: 260, damping: 18 }}
                    className="bg-gradient-to-b from-white/30 to-white/0 bg-clip-text text-4xl font-bold text-transparent"
                  >
                    {step.number}
                  </motion.span>
                  <motion.div
                    initial={{ opacity: 0, x: i % 2 === 0 ? 16 : -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, delay: i * 0.12 + 0.1 }}
                  >
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/50">{step.description}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          <Reveal delay={0.15} className="min-w-0">
            <StepsMock />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
