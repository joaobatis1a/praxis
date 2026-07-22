import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { buttonVariants } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import { isSupabase } from '../../../lib/dataSource'
import { SALES_WHATSAPP_URL } from '../../../lib/salesContact'
import { Reveal } from './Reveal'

function PulsingCta({ children }: { children: ReactNode }) {
  return (
    <div className="relative mt-10 inline-flex">
      <motion.div
        className="absolute inset-0 rounded-md"
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(79,125,249,0.45)',
            '0 0 0 14px rgba(79,125,249,0)',
            '0 0 0 0 rgba(79,125,249,0)',
          ],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
      />
      {children}
    </div>
  )
}

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
        {isSupabase ? (
          <>
            <p className="mt-5 text-lg text-white/60">Conta pra gente como sua empresa funciona e a gente te mostra o Praxis rodando nela.</p>
            <PulsingCta>
              <a
                href={SALES_WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'group inline-flex shadow-[0_0_0_0_rgba(79,125,249,0.5)] transition-all hover:shadow-[0_0_32px_4px_rgba(79,125,249,0.4)]',
                )}
              >
                Fale com a gente
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </a>
            </PulsingCta>
          </>
        ) : (
          <>
            <p className="mt-5 text-lg text-white/60">Crie sua conta em menos de um minuto e comece a organizar sua empresa.</p>
            <PulsingCta>
              <Link
                to="/signup"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'group inline-flex shadow-[0_0_0_0_rgba(79,125,249,0.5)] transition-all hover:shadow-[0_0_32px_4px_rgba(79,125,249,0.4)]',
                )}
              >
                Criar conta gratuita
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </PulsingCta>
          </>
        )}
      </Reveal>
    </section>
  )
}
