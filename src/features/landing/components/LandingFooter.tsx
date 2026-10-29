import { Link } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import logoSrc from '../../../assets/logo-praxis-mark.png'
import { isSupabase } from '../../../lib/dataSource'
import { SALES_WHATSAPP_URL } from '../../../lib/salesContact'
import { screens } from '../screens'
import { CtaPill } from './CtaPill'
import { SplitText } from './SplitText'

const strip = [
  screens.darkDashboard,
  screens.lightLibrary,
  screens.darkProcedures,
  screens.lightRoles,
  screens.darkNotices,
  screens.lightDashboard,
  screens.darkLibrary,
  screens.lightProcedures,
  screens.darkRoles,
]

const columns = [
  {
    title: 'Produto',
    links: [
      { label: 'Módulos', href: '#modulos' },
      { label: 'Por dentro', href: '#por-dentro' },
      { label: 'Na prática', href: '#como-comecar' },
    ],
  },
  {
    title: 'Acesso',
    links: [{ label: 'Entrar', href: '/login' }, ...(isSupabase ? [{ label: 'Criar conta', href: '/signup' }] : [])],
  },
  {
    title: 'Contato',
    links: [
      ...(isSupabase ? [{ label: 'WhatsApp', href: SALES_WHATSAPP_URL }] : []),
      { label: 'Termos de uso', href: '/termos' },
      { label: 'Privacidade', href: '/privacidade' },
    ],
  },
]

const linkClass = 'text-sm text-white/55 transition-colors hover:text-white'

function FooterLink({ label, href }: { label: string; href: string }) {
  if (href.startsWith('http'))
    return (
      <a href={href} target="_blank" rel="noreferrer" className={linkClass}>
        {label}
      </a>
    )
  if (href.startsWith('#'))
    return (
      <a href={href} className={linkClass}>
        {label}
      </a>
    )
  return (
    <Link to={href} className={linkClass}>
      {label}
    </Link>
  )
}

// The last dark sheet: a slow ribbon of real screens, the closing line and the links.
export function LandingFooter() {
  return (
    <footer className="relative z-40 -mt-10 overflow-hidden rounded-t-[2.5rem] bg-[#06080d] pt-12 sm:-mt-14 sm:rounded-t-[3.5rem]">
      <div
        aria-hidden
        className="flex overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
      >
        <div className="animate-marquee flex w-max gap-5 hover:[animation-play-state:paused]" style={{ animationDuration: '70s' }}>
          {[...strip, ...strip].map((src, i) => (
            <div
              key={i}
              className="w-[19rem] shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] transition-transform duration-500 hover:-translate-y-1.5 sm:w-[24rem]"
            >
              <img src={src} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover object-top" />
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-6 pt-16 sm:px-10">
        <div className="grid gap-14 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <p className="font-display text-[clamp(2.6rem,5vw,4.6rem)] font-bold leading-[0.95] tracking-[-0.045em] text-white">
              <span className="block">
                <SplitText text="Da ação" whenInView stagger={0.04} />
              </span>
              <span className="block">
                <SplitText text="à execução." whenInView delay={0.15} stagger={0.04} />
              </span>
            </p>
            <CtaPill className="mt-9" />
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:pt-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">{column.title}</p>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink {...link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-7 text-xs text-white/40">
          <span className="flex items-center gap-2.5">
            <img src={logoSrc} alt="" width={20} height={20} />© {new Date().getFullYear()} Praxis. Todos os direitos reservados.
          </span>
          <a href="#top" className="group inline-flex items-center gap-2 transition-colors hover:text-white">
            Voltar ao topo
            <ArrowUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  )
}
