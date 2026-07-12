import { motion } from 'framer-motion'
import { Bell, BookOpen, ClipboardList, Megaphone } from 'lucide-react'

const highlights = [
  { icon: BookOpen, label: 'Biblioteca de Conhecimento', description: 'Documentos versionados e organizados.' },
  { icon: ClipboardList, label: 'Procedimentos Operacionais', description: 'Checklists com etapas, vídeo e responsáveis.' },
  { icon: Megaphone, label: 'Avisos', description: 'Passagem de turno sem perder contexto.' },
  { icon: Bell, label: 'Central de Notificações', description: 'Cada pessoa avisada só do que importa.' },
]

export function LoginShowcasePanel() {
  return (
    <div className="relative hidden overflow-hidden bg-[#0a0e1a] md:block md:w-1/2">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(ellipse 55% 50% at 8% 0%, rgba(79,125,249,0.2), transparent)',
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-center px-16 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold leading-tight text-white"
        >
          Onde o conhecimento da sua empresa ganha memória.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-3 max-w-sm text-white/60"
        >
          Tudo o que sua equipe documenta, executa e comunica, em um só lugar.
        </motion.p>

        <div className="mt-12 grid grid-cols-2 gap-3">
          {highlights.map((highlight, i) => (
            <motion.div
              key={highlight.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="animate-float-sm rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
              style={{ animationDelay: `${-i * 1.2}s` }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#4f7df9]/15 text-[#6d94fa]">
                <highlight.icon size={16} />
              </div>
              <p className="mt-3 text-sm font-medium leading-snug text-white">{highlight.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/45">{highlight.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
