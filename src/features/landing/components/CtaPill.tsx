import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../../lib/cn'
import { isSupabase } from '../../../lib/dataSource'
import { SALES_WHATSAPP_URL } from '../../../lib/salesContact'
import { Magnetic } from './Magnetic'

// The one call to action used across the page: talk to sales on the real
// deployment, open the demo login on the demo one.
const ctaLabel = isSupabase ? 'Fale com a gente' : 'Ver a demonstração'

export function CtaPill({ className, size = 'md' }: { className?: string; size?: 'md' | 'lg' }) {
  const classes = cn(
    'group relative inline-flex items-center gap-3 overflow-hidden whitespace-nowrap rounded-full border border-white/25 font-semibold uppercase tracking-[0.12em] text-white',
    'bg-[linear-gradient(135deg,#2563eb_0%,#4f46e5_55%,#7c3aed_100%)] shadow-[0_18px_40px_-12px_rgba(79,70,229,0.75),inset_0_1px_0_rgba(255,255,255,0.35)]',
    'transition-shadow duration-300 hover:shadow-[0_22px_50px_-10px_rgba(79,70,229,0.95),inset_0_1px_0_rgba(255,255,255,0.45)]',
    size === 'lg' ? 'px-8 py-5 text-sm' : 'px-6 py-3.5 text-xs',
    className,
  )
  const inner = (
    <>
      {/* a sheen that sweeps across on hover */}
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/25 blur-md transition-transform duration-700 ease-out group-hover:translate-x-[320%] group-active:translate-x-[320%]" />
      <span className="relative">{ctaLabel}</span>
      <ArrowUpRight size={size === 'lg' ? 18 : 16} className="relative transition-transform duration-300 group-hover:rotate-45" />
    </>
  )

  return (
    <Magnetic strength={0.25}>
      {isSupabase ? (
        <a href={SALES_WHATSAPP_URL} target="_blank" rel="noreferrer" className={classes}>
          {inner}
        </a>
      ) : (
        <Link to="/login" className={classes}>
          {inner}
        </Link>
      )}
    </Magnetic>
  )
}
