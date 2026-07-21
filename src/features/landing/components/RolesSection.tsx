import { motion, type Variants } from 'framer-motion'
import { ClipboardCheck, ShieldCheck, UsersRound } from 'lucide-react'
import { cn } from '../../../lib/cn'
import { Reveal } from './Reveal'

const roles = [
  {
    icon: ShieldCheck,
    title: 'Proprietário',
    description: 'Acesso total à plataforma.',
    items: ['Gerencia usuários, cargos e permissões', 'Configura empresa e segurança', 'Vê tudo o que acontece no sistema'],
    entrance: { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0 } } satisfies Variants,
    hover: { y: -6 },
    cardClass: 'transition-shadow hover:shadow-[0_20px_60px_-15px_rgba(79,125,249,0.35)]',
  },
  {
    icon: UsersRound,
    title: 'Gestor',
    description: 'Comanda a equipe no dia a dia.',
    items: ['Cria procedimentos e envia avisos', 'Gerencia a própria equipe', 'Acompanha desempenho e progresso'],
    entrance: { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } } satisfies Variants,
    hover: { y: -6 },
    cardClass: 'transition-shadow hover:shadow-[0_20px_60px_-15px_rgba(79,125,249,0.35)]',
  },
  {
    icon: ClipboardCheck,
    title: 'Colaborador',
    description: 'Executa e consulta o que precisa.',
    items: ['Consulta documentos e procedimentos', 'Executa procedimentos e troca avisos com a equipe', 'Acompanha o que já concluiu'],
    entrance: { hidden: { opacity: 0, x: 32 }, show: { opacity: 1, x: 0 } } satisfies Variants,
    hover: { y: -6 },
    cardClass: 'transition-shadow hover:shadow-[0_20px_60px_-15px_rgba(79,125,249,0.35)]',
  },
]

export function RolesSection() {
  return (
    <section id="equipe" className="relative py-28">
      <div className="mx-auto max-w-[var(--container-page)] px-6">
        <Reveal className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6d94fa]">Permissões por cargo</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight text-white">
            Cada pessoa vê exatamente o que precisa.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {roles.map((role, i) => (
            <motion.div
              key={role.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={role.entrance}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
              whileHover={role.hover}
            >
              <div
                className={cn('h-full animate-float-sm rounded-xl border border-white/10 bg-white/[0.03] p-6', role.cardClass)}
                style={{ animationDelay: `${-i * 1.5}s` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#4f7df9]/15 text-[#6d94fa]">
                  <role.icon size={22} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{role.title}</h3>
                <p className="mt-1 text-sm text-white/50">{role.description}</p>
                <ul className="mt-5 space-y-2.5">
                  {role.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/65">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#6d94fa]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
