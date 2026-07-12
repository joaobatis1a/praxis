import { motion } from 'framer-motion'
import { ClipboardList, Clock, Pencil, Trash2, UserCheck } from 'lucide-react'
import { Badge, Button, Checkbox, Modal, ProgressBar } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import { staggerContainer, staggerItem } from '../../../lib/motionVariants'
import type { Procedure } from '../../../mocks/procedures'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function ProcedureDetailModal({
  procedure,
  onClose,
  onToggleStep,
  onEdit,
  onDelete,
}: {
  procedure: Procedure | null
  onClose: () => void
  onToggleStep: (procedureId: string, stepId: string) => void
  onEdit: (procedure: Procedure) => void
  onDelete: (procedure: Procedure) => void
}) {
  if (!procedure) return null
  const total = procedure.steps.length
  const done = procedure.completedStepIds.length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <Modal open={!!procedure} onClose={onClose} className="max-w-xl">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface text-primary">
          <ClipboardList size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-text-primary">{procedure.title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <Badge variant="neutral">{procedure.department}</Badge>
            <Badge variant={procedure.status === 'publicado' ? 'success' : 'warning'}>
              {procedure.status === 'publicado' ? 'Publicado' : 'Rascunho'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-text-muted">
        <span className="flex items-center gap-1.5">
          <UserCheck size={14} />
          Responsável: {procedure.responsible}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          ~{procedure.estimatedMinutes} min
        </span>
        <span>Atualizado em {formatDate(procedure.updatedAt)}</span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>
            {done}/{total} etapas concluídas
          </span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} className="mt-1.5" />
      </div>

      <motion.ol variants={staggerContainer} initial="hidden" animate="show" className="mt-4 space-y-1.5">
        {procedure.steps.map((step, i) => {
          const checked = procedure.completedStepIds.includes(step.id)
          return (
            <motion.li
              key={step.id}
              variants={staggerItem}
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-surface"
            >
              <Checkbox
                id={step.id}
                checked={checked}
                onChange={() => onToggleStep(procedure.id, step.id)}
                aria-label={step.text}
              />
              <label
                htmlFor={step.id}
                className={cn(
                  'flex-1 cursor-pointer text-sm',
                  checked ? 'text-text-muted line-through decoration-border-strong' : 'text-text-primary',
                )}
              >
                {i + 1}. {step.text}
              </label>
            </motion.li>
          )
        })}
      </motion.ol>

      <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="secondary" onClick={() => onEdit(procedure)}>
          <Pencil size={16} />
          Editar
        </Button>
        <Button variant="destructive" onClick={() => onDelete(procedure)}>
          <Trash2 size={16} />
          Excluir procedimento
        </Button>
      </div>
    </Modal>
  )
}
