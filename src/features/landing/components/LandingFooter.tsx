const columns = [
  {
    title: 'Produto',
    links: ['Solução', 'Como funciona', 'Segurança'],
  },
  {
    title: 'Empresa',
    links: ['Sobre', 'Contato', 'Carreiras'],
  },
  {
    title: 'Legal',
    links: ['Termos de uso', 'Privacidade'],
  },
]

export function LandingFooter({ className }: { className?: string }) {
  return (
    <footer id="contato" className={`border-t border-white/10 ${className ?? ''}`}>
      <div className="mx-auto max-w-[var(--container-page)] px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <span className="text-lg font-bold text-text-primary">Praxis</span>
            <p className="mt-2 text-sm text-text-muted">
              Gestão do conhecimento corporativo, em um só lugar.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-text-primary">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-text-muted hover:text-text-primary">
                      {link}
                    </a>
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
