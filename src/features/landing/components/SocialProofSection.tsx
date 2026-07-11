const companies = ['Norvia', 'Altix', 'Vertex Log', 'Bluepeak', 'Cedro Corp']

export function SocialProofSection() {
  return (
    <section className="mx-auto max-w-[var(--container-page)] px-6 py-20">
      <p className="text-center text-sm font-semibold uppercase tracking-wider text-text-muted">
        Empresas que confiam no Praxis
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {companies.map((company) => (
          <span key={company} className="text-lg font-bold text-text-muted/70">
            {company}
          </span>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-2xl rounded-lg border border-border bg-surface-card p-8 text-center shadow-[var(--shadow-level-1)]">
        <p className="text-lg text-text-secondary">
          "Reduzimos o tempo de onboarding pela metade depois que centralizamos os procedimentos
          e treinamentos no Praxis."
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            MD
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-text-primary">Mariana Duarte</p>
            <p className="text-xs text-text-muted">Head de Operações, Norvia</p>
          </div>
        </div>
      </div>
    </section>
  )
}
