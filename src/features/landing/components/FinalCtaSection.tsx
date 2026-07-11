import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import { Reveal } from './Reveal'

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="animate-gradient absolute inset-0 bg-gradient-to-br from-primary via-[#4338ca] to-[#0891b2]"
      />
      <div
        aria-hidden
        className="bg-grid absolute inset-0 opacity-[0.08] mix-blend-overlay"
      />

      <Reveal className="relative mx-auto max-w-[var(--container-page)] px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-white">
          Pronto para organizar o conhecimento da sua empresa?
        </h2>
        <p className="mt-3 text-white/80">Comece gratuitamente, sem cartão de crédito.</p>
        <Link
          to="/signup"
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'lg' }),
            'group mt-8 inline-flex border-0 bg-white text-primary shadow-lg transition-transform hover:scale-105 hover:bg-white/90',
          )}
        >
          Criar conta gratuita
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </section>
  )
}
