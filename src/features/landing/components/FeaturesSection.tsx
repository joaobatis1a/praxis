import { motion, type Variants } from 'framer-motion'
import { BookOpen, ClipboardList, GraduationCap, Route } from 'lucide-react'
import { Reveal } from './Reveal'

const features = [
  {
    icon: BookOpen,
    title: 'Biblioteca de Conhecimento',
    description: 'Categorias, pastas e documentos organizados, com versionamento e histórico completo.',
  },
  {
    icon: ClipboardList,
    title: 'Procedimentos Operacionais',
    description: 'SOPs com checklist, etapas e responsáveis, sempre atualizados e fáceis de seguir.',
  },
  {
    icon: GraduationCap,
    title: 'Treinamentos',
    description: 'Cursos em vídeo, PDF e questionários, com certificados ao final de cada trilha.',
  },
  {
    icon: Route,
    title: 'Trilhas de Aprendizagem',
    description: 'Sequências de treinamentos com progresso acompanhado do início ao fim.',
  },
]

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } },
}

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="mx-auto max-w-[var(--container-page)] px-6 py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-text-primary">Tudo que sua equipe precisa</h2>
        <p className="mt-3 text-text-muted">
          Um único lugar para documentar, treinar e acompanhar a evolução do time.
        </p>
      </Reveal>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={item}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-lg border border-border bg-surface-card p-6 shadow-[var(--shadow-level-1)] transition-shadow hover:shadow-[var(--shadow-level-2)]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-xl transition-transform duration-500 group-hover:scale-150"
            />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
              <feature.icon size={20} />
            </div>
            <h3 className="relative mt-4 text-base font-semibold text-text-primary">{feature.title}</h3>
            <p className="relative mt-2 text-sm text-text-muted">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
