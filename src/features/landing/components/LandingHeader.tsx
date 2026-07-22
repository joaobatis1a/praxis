import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { buttonVariants } from '../../../components/ui'
import logoSrc from '../../../assets/logo-praxis.png'
import { cn } from '../../../lib/cn'
import { isSupabase } from '../../../lib/dataSource'
import { SALES_WHATSAPP_URL } from '../../../lib/salesContact'

const navLinks = [
  { href: '#top', label: 'Home' },
  { href: '#solucao', label: 'Solução' },
  { href: '#produto', label: 'Produto' },
  { href: '#equipe', label: 'Equipe' },
  { href: '#como-funciona', label: 'Como funciona' },
]

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 8)
  })

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-x-0 top-4 z-40 flex justify-center px-4"
    >
      <div
        className={cn(
          'flex h-14 w-full items-center justify-between gap-4 rounded-full border px-4 backdrop-blur-xl transition-all duration-300 sm:px-5',
          scrolled
            ? 'max-w-4xl border-border bg-surface-card/85 shadow-[var(--shadow-level-2)]'
            : 'max-w-6xl border-border/50 bg-surface-card/60 shadow-[var(--shadow-level-1)]',
        )}
      >
        <Link to="/" className="group inline-flex shrink-0 items-center gap-2 font-brand text-xl font-bold transition-transform hover:scale-105">
          <img src={logoSrc} alt="" width={28} height={28} className="rounded-md" />
          <span className="bg-clip-text text-text-primary transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:via-[#7c6bff] group-hover:to-[#22d3ee] group-hover:text-transparent">
            Praxis
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" onMouseLeave={() => setHovered(null)}>
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHovered(i)}
              className="relative rounded-full px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              <AnimatePresence>
                {hovered === i && (
                  <motion.span
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 z-0 rounded-full bg-surface-hover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </AnimatePresence>
              <span className="relative z-10">{link.label}</span>
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/login"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'rounded-full')}
          >
            Entrar
          </Link>
          {isSupabase ? (
            <a
              href={SALES_WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ size: 'sm' }),
                'rounded-full shadow-[0_0_0_0_rgba(79,125,249,0.5)] transition-shadow hover:shadow-[0_0_20px_2px_rgba(79,125,249,0.45)]',
              )}
            >
              Fale com a gente
            </a>
          ) : (
            <Link
              to="/signup"
              className={cn(
                buttonVariants({ size: 'sm' }),
                'rounded-full shadow-[0_0_0_0_rgba(79,125,249,0.5)] transition-shadow hover:shadow-[0_0_20px_2px_rgba(79,125,249,0.45)]',
              )}
            >
              Criar conta
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  )
}
