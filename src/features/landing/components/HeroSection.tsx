import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle2, FileText, GraduationCap } from 'lucide-react'
import { Badge, buttonVariants } from '../../../components/ui'

export function HeroSection() {
  return (
    <section className="mx-auto max-w-[var(--container-page)] px-6 py-20 md:py-28">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl">
            Centralize o conhecimento da sua empresa em um só lugar
          </h1>
          <p className="mt-5 text-lg text-text-secondary">
            Documentação, procedimentos e treinamentos organizados e acessíveis — sem depender da
            memória de ninguém.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/signup" className={buttonVariants({ size: 'lg' })}>
              Começar agora
              <ArrowRight size={18} />
            </Link>
            <a href="#como-funciona" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
              Ver como funciona
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-xl border border-border bg-surface-card p-4 shadow-[var(--shadow-level-2)]">
            <div className="flex items-center gap-1.5 border-b border-border pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-error" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning" />
              <span className="h-2.5 w-2.5 rounded-full bg-success" />
              <span className="ml-3 text-xs text-text-muted">app.praxis.com/dashboard</span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-md bg-surface p-3">
                <p className="text-xs text-text-muted">Documentos</p>
                <p className="text-xl font-bold text-text-primary">312</p>
              </div>
              <div className="rounded-md bg-surface p-3">
                <p className="text-xs text-text-muted">Treinamentos</p>
                <p className="text-xl font-bold text-text-primary">16</p>
              </div>
              <div className="rounded-md bg-surface p-3">
                <p className="text-xs text-text-muted">Progresso</p>
                <p className="text-xl font-bold text-text-primary">73%</p>
              </div>
            </div>

            <div className="mt-3 space-y-2 rounded-md border border-border p-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <FileText size={16} className="shrink-0 text-primary" />
                <span className="min-w-0 truncate">Manual de Onboarding</span>
                <Badge variant="success" className="ml-auto shrink-0">Publicado</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <BookOpen size={16} className="shrink-0 text-primary" />
                <span className="min-w-0 truncate">Política de Segurança</span>
                <Badge variant="primary" className="ml-auto shrink-0">Em revisão</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <GraduationCap size={16} className="shrink-0 text-primary" />
                <span className="min-w-0 truncate">Treinamento de Compliance</span>
                <Badge variant="neutral" className="ml-auto shrink-0">
                  <CheckCircle2 size={12} /> Concluído
                </Badge>
              </div>
            </div>
          </div>

          <div className="absolute -left-6 top-full mt-4 hidden rounded-lg border border-border bg-surface-card p-3 shadow-[var(--shadow-level-2)] md:block">
            <p className="text-xs text-text-muted">Progresso da equipe</p>
            <p className="text-lg font-bold text-success">+18% este mês</p>
          </div>
        </div>
      </div>
    </section>
  )
}
