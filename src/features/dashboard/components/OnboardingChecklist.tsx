import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Check, ClipboardCheck, Users, X } from 'lucide-react'
import { Card, ProgressBar } from '../../../components/ui'
import { dismissOnboarding, type OnboardingStatus } from '../api'

interface OnboardingChecklistProps {
  status: OnboardingStatus
  onDismiss: () => void
}

export function OnboardingChecklist({ status, onDismiss }: OnboardingChecklistProps) {
  const navigate = useNavigate()

  const steps = [
    {
      done: status.invitedTeam,
      label: 'Convide sua equipe',
      description: 'Adicione ao menos uma pessoa em Usuários.',
      icon: Users,
      to: '/usuarios',
    },
    {
      done: status.publishedProcedure,
      label: 'Publique um procedimento',
      description: 'Registre o primeiro processo da sua empresa.',
      icon: ClipboardCheck,
      to: '/procedimentos',
    },
    {
      done: status.addedDocument,
      label: 'Adicione um documento',
      description: 'Comece a Biblioteca de Conhecimento.',
      icon: BookOpen,
      to: '/biblioteca',
    },
  ]

  const doneCount = steps.filter((s) => s.done).length
  const allDone = doneCount === steps.length

  if (status.dismissed) return null

  async function handleDismiss() {
    onDismiss()
    try {
      await dismissOnboarding()
    } catch {
      // best-effort — worst case it reappears next load, not worth surfacing an error toast for this
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginTop: 0 }}
        className="mt-6 overflow-hidden"
      >
        <Card className="relative">
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dispensar checklist"
            className="absolute right-4 top-4 rounded-sm p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <X size={16} />
          </button>

          <div className="pr-8">
            <h3 className="text-base font-semibold text-text-primary">Primeiros passos na Praxis</h3>
            <p className="mt-1 text-sm text-text-muted">
              {allDone ? 'Tudo pronto! Sua empresa já está rodando.' : `${doneCount} de ${steps.length} concluídos.`}
            </p>
            <ProgressBar value={(doneCount / steps.length) * 100} className="mt-3 max-w-sm" />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {steps.map((step) => (
              <button
                key={step.label}
                type="button"
                onClick={() => navigate(step.to)}
                className="flex items-start gap-3 rounded-md border border-border p-3 text-left transition-colors hover:bg-surface-hover"
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    step.done ? 'bg-primary text-white' : 'bg-surface text-text-secondary'
                  }`}
                >
                  {step.done ? <Check size={14} /> : <step.icon size={14} />}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${step.done ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">{step.description}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
