import { motion } from 'framer-motion'
import { Reveal } from './Reveal'

const steps = [
  {
    number: '1',
    title: 'Centralize seus documentos',
    description: 'Importe e organize toda a documentação da empresa em categorias e pastas.',
  },
  {
    number: '2',
    title: 'Crie treinamentos e procedimentos',
    description: 'Monte cursos, checklists e SOPs a partir do conteúdo já centralizado.',
  },
  {
    number: '3',
    title: 'Acompanhe a evolução da equipe',
    description: 'Veja o progresso de cada colaborador e identifique lacunas de conhecimento.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="bg-surface py-20">
      <div className="mx-auto max-w-[var(--container-page)] px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold text-text-primary">Como funciona</h2>
        </Reveal>

        <div className="relative mt-12 grid gap-8 md:grid-cols-3">
          <div className="absolute left-[16.5%] right-[16.5%] top-5 hidden h-px bg-border md:block" aria-hidden>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
              className="h-full origin-left bg-gradient-to-r from-primary via-[#7c6bff] to-[#22d3ee]"
            />
          </div>

          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 0.15} className="relative text-center md:text-left">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: i * 0.15 + 0.3, type: 'spring', stiffness: 300 }}
                className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-[0_0_20px_2px_rgba(37,99,235,0.35)] md:mx-0"
              >
                {step.number}
              </motion.div>
              <h3 className="mt-4 text-base font-semibold text-text-primary">{step.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
