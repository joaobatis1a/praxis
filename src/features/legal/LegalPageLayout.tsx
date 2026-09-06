import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../../components/ui'

export function LegalPageLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link to="/" className="inline-flex">
          <Logo />
        </Link>

        <article className="mt-8 flex flex-col gap-4 text-sm leading-relaxed text-text-secondary">
          <h1 className="font-brand text-3xl font-bold text-text-primary">{title}</h1>
          <p className="text-text-muted">Última atualização: setembro de 2026.</p>
          {children}
        </article>
      </div>
    </div>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h2 className="mt-4 text-lg font-semibold text-text-primary">{title}</h2>
      <p>{children}</p>
    </>
  )
}
