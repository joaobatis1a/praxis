import { motion, type Variants } from 'framer-motion'
import { AlertTriangle, Puzzle, UserX } from 'lucide-react'
import { Reveal } from './Reveal'

const problems = [
  {
    icon: UserX,
    title: 'Conhecimento perdido quando um colaborador sai',
    description: 'Processos inteiros desaparecem com quem os executava, forçando a equipe a recomeçar do zero.',
  },
  {
    icon: Puzzle,
    title: 'Processos que só existem na cabeça das pessoas',
    description: 'Sem documentação padronizada, cada pessoa executa a mesma tarefa de um jeito diferente.',
  },
  {
    icon: AlertTriangle,
    title: 'Treinamentos desorganizados',
    description: 'Materiais espalhados em pastas, e-mails e planilhas dificultam o onboarding e a atualização da equipe.',
  },
]

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
}

export function ProblemsSection() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-[var(--container-page)] px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold text-text-primary">Sua empresa também enfrenta isso?</h2>
        </Reveal>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid gap-6 md:grid-cols-3"
        >
          {problems.map((problem) => (
            <motion.div
              key={problem.title}
              variants={item}
              whileHover={{ y: -4 }}
              className="rounded-lg border border-border bg-surface-card p-6 transition-shadow hover:shadow-[var(--shadow-level-2)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-error-bg text-error">
                <problem.icon size={20} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-text-primary">{problem.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{problem.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
