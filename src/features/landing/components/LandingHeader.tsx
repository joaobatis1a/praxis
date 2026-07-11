import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { buttonVariants } from '../../../components/ui'
import { cn } from '../../../lib/cn'

const navLinks = [
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#planos', label: 'Planos' },
  { href: '#contato', label: 'Contato' },
]

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 8)
  })

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'sticky top-0 z-40 border-b transition-all duration-300',
        scrolled
          ? 'border-border bg-background/75 shadow-[var(--shadow-level-1)] backdrop-blur-lg'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[var(--container-page)] items-center justify-between px-6">
        <span className="text-lg font-bold text-text-primary">Praxis</span>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            Entrar
          </Link>
          <Link
            to="/signup"
            className={cn(
              buttonVariants({ size: 'sm' }),
              'shadow-[0_0_0_0_rgba(37,99,235,0.5)] transition-shadow hover:shadow-[0_0_20px_2px_rgba(37,99,235,0.45)]',
            )}
          >
            Criar conta
          </Link>
        </div>
      </div>
    </motion.header>
  )
}
