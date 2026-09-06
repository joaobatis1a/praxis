import { Link } from 'react-router-dom'
import { Logo } from '../../../components/ui'

const columns = [
  {
    title: 'Produto',
    links: [
      { label: 'Solução', to: '#' },
      { label: 'Como funciona', to: '#' },
      { label: 'Segurança', to: '#' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre', to: '#' },
      { label: 'Contato', to: '#' },
      { label: 'Carreiras', to: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Termos de uso', to: '/termos' },
      { label: 'Privacidade', to: '/privacidade' },
    ],
  },
]

export function LandingFooter({ className }: { className?: string }) {
  return (
    <footer id="contato" className={`border-t border-white/10 ${className ?? ''}`}>
      <div className="mx-auto max-w-[var(--container-page)] px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Logo textClassName="text-text-primary" />
            <p className="mt-2 text-sm text-text-muted">Práxis: da ação à execução.</p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-text-primary">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-text-muted hover:text-text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-text-muted">
          © {new Date().getFullYear()} Praxis. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
