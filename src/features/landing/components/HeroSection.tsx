import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, BookOpen, CheckCircle2, FileText, GraduationCap, Sparkles } from 'lucide-react'
import { Badge, buttonVariants } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import { useCountUp } from '../../../lib/useCountUp'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } },
}

function Stat({ label, target, suffix = '' }: { label: string; target: number; suffix?: string }) {
  const { ref, value } = useCountUp(target)
  return (
    <div ref={ref} className="rounded-md bg-surface p-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-xl font-bold text-text-primary">
        {value}
        {suffix}
      </p>
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-grid mask-fade-b opacity-[0.4] dark:opacity-[0.25]"
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -top-32 left-1/4 -z-10 h-[32rem] w-[32rem] rounded-full bg-primary/25 blur-[110px]"
      />
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -top-10 right-0 -z-10 h-[26rem] w-[26rem] rounded-full bg-[#7c6bff]/20 blur-[110px]"
        style={{ animationDelay: '-6s' }}
      />

      <div className="mx-auto max-w-[var(--container-page)] px-6 py-20 md:py-28">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid items-center gap-12 md:grid-cols-2"
        >
          <div>
            <motion.span
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-card/80 px-3 py-1 text-xs font-semibold text-text-secondary backdrop-blur"
            >
              <Sparkles size={14} className="text-primary" />
              Gestão do conhecimento, reinventada
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" />
            </motion.span>

            <motion.h1
              variants={item}
              className="mt-5 text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-5xl"
            >
              Centralize o <span className="text-gradient animate-gradient">conhecimento</span> da
              sua empresa em um só lugar
            </motion.h1>

            <motion.p variants={item} className="mt-5 text-lg text-text-secondary">
              Documentação, procedimentos e treinamentos organizados e acessíveis — sem depender da
              memória de ninguém.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/signup"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'group shadow-[0_0_0_0_rgba(37,99,235,0.5)] transition-all hover:shadow-[0_0_28px_4px_rgba(37,99,235,0.4)]',
                )}
              >
                Começar agora
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#como-funciona" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
                Ver como funciona
              </a>
            </motion.div>
          </div>

          <motion.div
            variants={item}
            className="relative"
            whileHover={{ rotateX: -2, rotateY: 3 }}
            style={{ perspective: 1000 }}
          >
            <div className="animate-float rounded-xl border border-border bg-surface-card/90 p-4 shadow-[var(--shadow-level-2)] backdrop-blur">
              <div className="flex items-center gap-1.5 border-b border-border pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-error" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                <span className="h-2.5 w-2.5 rounded-full bg-success" />
                <span className="ml-3 text-xs text-text-muted">app.praxis.com/dashboard</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <Stat label="Documentos" target={312} />
                <Stat label="Treinamentos" target={16} />
                <Stat label="Progresso" target={73} suffix="%" />
              </div>

              <div className="mt-3 space-y-2 rounded-md border border-border p-3">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <FileText size={16} className="shrink-0 text-primary" />
                  <span className="min-w-0 truncate">Manual de Onboarding</span>
                  <Badge variant="success" className="ml-auto shrink-0">Publicado</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <BookOpen size={16} className="shrink-0 text-primary" />
                  <span className="min-w-0 truncate">Política de Segurança</span>
                  <Badge variant="primary" className="ml-auto shrink-0">Em revisão</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <GraduationCap size={16} className="shrink-0 text-primary" />
                  <span className="min-w-0 truncate">Treinamento de Compliance</span>
                  <Badge variant="neutral" className="ml-auto shrink-0">
                    <CheckCircle2 size={12} /> Concluído
                  </Badge>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="absolute -left-6 top-full mt-4 hidden rounded-lg border border-border bg-surface-card p-3 shadow-[var(--shadow-level-2)] md:block"
            >
              <p className="text-xs text-text-muted">Progresso da equipe</p>
              <p className="text-lg font-bold text-success">+18% este mês</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
