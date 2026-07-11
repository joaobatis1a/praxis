import { BookOpen, ClipboardList, GraduationCap, Route } from 'lucide-react'

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

export function FeaturesSection() {
  return (
    <section id="funcionalidades" className="mx-auto max-w-[var(--container-page)] px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-text-primary">Tudo que sua equipe precisa</h2>
        <p className="mt-3 text-text-muted">
          Um único lugar para documentar, treinar e acompanhar a evolução do time.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border border-border bg-surface-card p-6 shadow-[var(--shadow-level-1)] transition-shadow hover:shadow-[var(--shadow-level-2)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <feature.icon size={20} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-text-primary">{feature.title}</h3>
            <p className="mt-2 text-sm text-text-muted">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
