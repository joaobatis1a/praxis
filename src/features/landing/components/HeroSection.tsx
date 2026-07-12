import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Award, BookOpen, FileText } from 'lucide-react'
import { Badge, buttonVariants } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import { useCountUp } from '../../../lib/useCountUp'

const headline = ['Onde o conhecimento', 'da sua empresa', 'ganha memória.']

function Stat({ label, target, suffix = '' }: { label: string; target: number; suffix?: string }) {
  const { ref, value } = useCountUp(target)
  return (
    <div ref={ref} className="rounded-md bg-white/5 p-3">
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-xl font-bold text-white">
        {value}
        {suffix}
      </p>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative flex min-h-[92vh] flex-col justify-center overflow-hidden pt-28 sm:pt-24">
      <div className="relative z-10 mx-auto grid w-full max-w-[var(--container-page)] gap-16 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-white/60"
          >
            Gestão do conhecimento corporativo
          </motion.div>

          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {headline.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  initial={{ y: '110%' }}
                  animate={{ y: '0%' }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className={cn('block', i === 2 && 'text-white/40')}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 max-w-md text-lg text-white/60"
          >
            Documentação, procedimentos e a comunicação da equipe, conectados em um único sistema — para que
            o que sua equipe sabe não desapareça quando ela sai da sala.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/signup"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'group shadow-[0_0_0_0_rgba(79,125,249,0.5)] transition-all hover:shadow-[0_0_32px_4px_rgba(79,125,249,0.4)]',
              )}
            >
              Começar agora
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#solucao"
              className="text-sm font-medium text-white/70 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white hover:decoration-white/60"
            >
              Ver como funciona
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: 1200 }}
          className="relative"
        >
          <div className="animate-float rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="flex items-center gap-1.5 border-b border-white/10 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffd166]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
              <span className="ml-3 text-xs text-white/40">app.praxis.com/dashboard</span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat label="Documentos" target={312} />
              <Stat label="Procedimentos" target={24} />
              <Stat label="Progresso" target={73} suffix="%" />
            </div>

            <div className="mt-3 space-y-2 rounded-md border border-white/10 p-3">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <FileText size={16} className="shrink-0 text-[#6d94fa]" />
                <span className="min-w-0 truncate">Manual de Onboarding</span>
                <Badge variant="success" className="ml-auto shrink-0">Publicado</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <BookOpen size={16} className="shrink-0 text-[#6d94fa]" />
                <span className="min-w-0 truncate">Política de Segurança</span>
                <Badge variant="primary" className="ml-auto shrink-0">Em revisão</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Award size={16} className="shrink-0 text-amber-400" />
                <span className="min-w-0 truncate">Abertura de chamado</span>
                <Badge className="ml-auto shrink-0 border-amber-400/30 bg-amber-400/15 text-amber-300">
                  <Award size={12} /> Concluído
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
