import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import { Reveal } from './Reveal'

export function FinalCtaSection() {
  return (
    <section className="relative py-36">
      <Reveal className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
          Sua empresa não deveria depender da{' '}
          <span className="bg-gradient-to-r from-[#6d94fa] to-[#8b95ff] bg-clip-text text-transparent">
            memória de ninguém.
          </span>
        </h2>
        <p className="mt-5 text-lg text-white/60">Comece gratuitamente, sem cartão de crédito.</p>
        <Link
          to="/signup"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'group mt-10 inline-flex shadow-[0_0_0_0_rgba(79,125,249,0.5)] transition-all hover:shadow-[0_0_32px_4px_rgba(79,125,249,0.4)]',
          )}
        >
          Criar conta gratuita
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </section>
  )
}
