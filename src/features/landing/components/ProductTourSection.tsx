import { motion } from 'framer-motion'
import { BookOpen, Clock, FileClock, ListChecks, UserCheck } from 'lucide-react'
import { Badge } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import { Reveal } from './Reveal'

const rows = [
  {
    eyebrow: 'Biblioteca de Conhecimento',
    title: 'Cada documento, com histórico e dono.',
    description:
      'Categorias, pastas e subpastas organizadas como sua empresa realmente pensa. Toda edição fica registrada — versionamento e histórico completo, sem perder o que já existia.',
    icon: BookOpen,
    reverse: false,
  },
  {
    eyebrow: 'Procedimentos Operacionais',
    title: 'Processos que sobrevivem à saída de alguém.',
    description:
      'Checklists com etapas, responsável e status. Um SOP no Praxis não é um PDF esquecido — é um processo vivo que qualquer pessoa da equipe consegue seguir.',
    icon: ListChecks,
    reverse: true,
  },
]

function LibraryMock() {
  return (
    <div
      className="animate-float-sm rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      style={{ animationDelay: '-1.5s' }}
    >
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-xs text-white/40">
        <BookOpen size={14} />
        Biblioteca / Onboarding / Políticas
      </div>
      <div className="mt-3 space-y-2">
        {[
          { name: 'Política de Segurança da Informação', version: 'v4', updated: 'há 2 dias' },
          { name: 'Manual do Colaborador', version: 'v12', updated: 'há 1 semana' },
          { name: 'Guia de Atendimento ao Cliente', version: 'v3', updated: 'há 3 semanas' },
        ].map((doc) => (
          <div
            key={doc.name}
            className="flex items-center gap-3 rounded-md border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-[#4f7df9]/40 hover:bg-white/[0.04]"
          >
            <FileClock size={16} className="shrink-0 text-[#6d94fa]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white/80">{doc.name}</p>
              <p className="text-xs text-white/40">Atualizado {doc.updated}</p>
            </div>
            <Badge variant="neutral" className="shrink-0 border-white/10 bg-white/5 text-white/60">
              {doc.version}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProcedureMock() {
  const steps = ['Confirmar identidade do cliente', 'Validar dados no sistema', 'Registrar solicitação', 'Enviar confirmação por e-mail']
  return (
    <div
      className="animate-float-sm rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      style={{ animationDelay: '-3s' }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <p className="text-sm font-medium text-white/80">Abertura de chamado — SOP</p>
        <Badge variant="success" className="border-transparent">Publicado</Badge>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
        <UserCheck size={14} /> Responsável: Time de Suporte
        <Clock size={14} className="ml-3" /> ~15 min
      </div>
      <div className="mt-4 space-y-2.5">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: i * 0.12 }}
            className="flex items-center gap-3"
          >
            <div
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold',
                i < 2 ? 'border-[#4f7df9] bg-[#4f7df9] text-white' : 'border-white/20 text-white/40',
              )}
            >
              {i < 2 ? '✓' : i + 1}
            </div>
            <p className={cn('text-sm', i < 2 ? 'text-white/50 line-through decoration-white/30' : 'text-white/80')}>
              {step}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function ProductTourSection() {
  return (
    <section id="produto" className="relative py-28">
      <div className="mx-auto max-w-[var(--container-page)] px-6">
        <div className="space-y-28">
          {rows.map((row) => (
            <div
              key={row.eyebrow}
              className={cn(
                'grid items-center gap-12 lg:grid-cols-2',
                row.reverse && 'lg:[&>*:first-child]:order-2',
              )}
            >
              <Reveal>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#4f7df9]/15 text-[#6d94fa]">
                  <row.icon size={20} />
                </div>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#6d94fa]">
                  {row.eyebrow}
                </p>
                <h3 className="mt-2 max-w-md text-3xl font-bold leading-tight text-white">{row.title}</h3>
                <p className="mt-4 max-w-md text-white/55">{row.description}</p>
              </Reveal>

              <Reveal delay={0.1}>{row.eyebrow.includes('Biblioteca') ? <LibraryMock /> : <ProcedureMock />}</Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
