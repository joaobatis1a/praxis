import { motion } from 'framer-motion'
import { Award, ClipboardList } from 'lucide-react'
import { Badge, Modal, ProgressBar } from '../../../components/ui'
import { staggerContainer, staggerItem } from '../../../lib/motionVariants'
import type { ProcedureCompletion } from '../../../mocks/procedureCompletions'
import type { Procedure } from '../../../mocks/procedures'
import type { TeamMember } from '../../../mocks/teamMembers'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface UserProgressModalProps {
  member: TeamMember | null
  procedures: Procedure[]
  completions: ProcedureCompletion[]
  onClose: () => void
}

export function UserProgressModal({ member, procedures, completions, onClose }: UserProgressModalProps) {
  if (!member) return null

  const myCompletions = completions
    .filter((c) => c.userId === member.id)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
  const completedIds = new Set(myCompletions.map((c) => c.procedureId))
  const relevantProcedures = procedures.filter((p) => p.department === member.department)
  const pending = relevantProcedures.filter((p) => !completedIds.has(p.id))
  const total = relevantProcedures.length
  const doneCount = relevantProcedures.length - pending.length
  const progress = total > 0 ? Math.round((doneCount / total) * 100) : 0

  return (
    <Modal
      open={!!member}
      onClose={onClose}
      title={`Progresso de ${member.name}`}
      description={`Procedimentos do setor ${member.department}`}
      className="max-w-lg"
    >
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>
          {doneCount}/{total} procedimentos do setor concluídos por {member.name.split(' ')[0]}
        </span>
        <span>{progress}%</span>
      </div>
      <ProgressBar value={progress} className="mt-1.5" />

      <div className="mt-5">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
          <Award size={14} className="text-amber-500" />
          Concluídos ({myCompletions.length})
        </h3>
        {myCompletions.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">Nenhum procedimento concluído ainda.</p>
        ) : (
          <motion.ul variants={staggerContainer} initial="hidden" animate="show" className="mt-2 space-y-1.5">
            {myCompletions.map((c) => (
              <motion.li
                key={c.id}
                variants={staggerItem}
                className="flex items-center justify-between rounded-md border border-amber-400/30 bg-amber-400/[0.06] px-3 py-2 text-sm"
              >
                <span className="text-text-primary">{c.procedureTitle}</span>
                <span className="shrink-0 text-xs text-text-muted">{formatDate(c.completedAt)}</span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>

      <div className="mt-5">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
          <ClipboardList size={14} />
          Pendentes ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">Nenhum procedimento pendente no setor.</p>
        ) : (
          <motion.ul variants={staggerContainer} initial="hidden" animate="show" className="mt-2 space-y-1.5">
            {pending.map((p) => (
              <motion.li key={p.id} variants={staggerItem} className="rounded-md border border-border px-3 py-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-text-primary">{p.title}</span>
                  <Badge variant={p.status === 'publicado' ? 'success' : 'warning'}>
                    {p.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </div>
                {p.steps.length > 0 && (
                  <p className="mt-1 text-xs text-text-muted">
                    Checklist geral: {p.completedStepIds.length}/{p.steps.length} etapas marcadas
                  </p>
                )}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </Modal>
  )
}
