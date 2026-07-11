import { Link } from 'react-router-dom'
import { buttonVariants } from '../../../components/ui'

const navLinks = [
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#planos', label: 'Planos' },
  { href: '#contato', label: 'Contato' },
]

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[var(--container-page)] items-center justify-between px-6">
        <span className="text-lg font-bold text-text-primary">Praxis</span>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Entrar
          </Link>
          <Link to="/signup" className={buttonVariants({ size: 'sm' })}>
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  )
}
