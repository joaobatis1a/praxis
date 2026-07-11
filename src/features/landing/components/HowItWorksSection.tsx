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
        <h2 className="text-center text-3xl font-bold text-text-primary">Como funciona</h2>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center md:text-left">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground md:mx-0">
                {step.number}
              </div>
              <h3 className="mt-4 text-base font-semibold text-text-primary">{step.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
