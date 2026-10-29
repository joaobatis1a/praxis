import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import logoSrc from '../../../assets/logo-praxis-mark.png'
import { cn } from '../../../lib/cn'

const links = [
  { href: '#modulos', label: 'Módulos' },
  { href: '#por-dentro', label: 'Por dentro' },
  { href: '#como-comecar', label: 'Na prática' },
  { href: '#contato', label: 'Contato' },
]

// One floating bar with the same shape everywhere; scrolling only firms up its
// background so it never sits see-through over product screens.
export function LandingHeader() {
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()

  // the page underneath stays put while the menu is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // tucks away on the way down, comes back on the way up; state only flips when it changes
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const hide = latest > (scrollY.getPrevious() ?? 0) && latest > 160
    setHidden((h) => (h === hide ? h : hide))
    setSolid((s) => (s === latest > 40 ? s : latest > 40))
  })

  return (
    <>
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: hidden && !open ? -100 : 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3"
    >
      <div
        className={cn(
          'mx-auto flex h-14 max-w-5xl items-center justify-between gap-6 rounded-full border px-4 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 sm:px-6',
          solid || open
            ? 'border-white/10 bg-[#0b0f1a]/90 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]'
            : 'border-white/[0.06] bg-white/[0.03]',
        )}
      >
        <Link to="/" className="flex shrink-0 items-center gap-2 font-brand text-lg font-extrabold tracking-tight text-white">
          <img src={logoSrc} alt="" width={26} height={26} />
          Praxis
        </Link>
        <nav className="hidden flex-1 items-center justify-center gap-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="group relative py-2 transition-colors hover:text-white">
              {link.label}
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="shrink-0 rounded-full bg-white px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0b0d12] transition-colors hover:bg-[#dbe5ff]"
          >
            Entrar
          </Link>
          {/* phones get the same four destinations behind a two-line toggle */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/15 md:hidden"
          >
            <span className={cn('absolute h-px w-4 bg-white transition-transform duration-300', open ? 'rotate-45' : '-translate-y-[3px]')} />
            <span className={cn('absolute h-px w-4 bg-white transition-transform duration-300', open ? '-rotate-45' : 'translate-y-[3px]')} />
          </button>
        </div>
      </div>
    </motion.header>

    <AnimatePresence>
      {open && (
        <motion.div
          id="menu-mobile"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-40 flex flex-col justify-between bg-[#06080d] px-6 pb-10 pt-28 md:hidden"
        >
          <nav className="flex flex-col">
            {links.map((link, i) => (
              <span key={link.href} className="overflow-hidden border-b border-white/10">
                <motion.a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '110%' }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.06 }}
                  className="flex items-baseline gap-4 py-4 font-display text-[clamp(2.4rem,11vw,3.6rem)] font-bold leading-none tracking-[-0.04em] text-white active:text-[#6d94fa]"
                >
                  <span className="text-sm font-semibold tracking-normal text-white/35">0{i + 1}</span>
                  {link.label}
                </motion.a>
              </span>
            ))}
          </nav>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.45 } }}
            exit={{ opacity: 0 }}
          >
            <Link
              to="/login"
              className="flex items-center justify-between rounded-full bg-[linear-gradient(135deg,#2563eb_0%,#4f46e5_55%,#7c3aed_100%)] px-7 py-5 text-sm font-semibold uppercase tracking-[0.12em] text-white"
            >
              Entrar no Praxis
              <ArrowUpRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
