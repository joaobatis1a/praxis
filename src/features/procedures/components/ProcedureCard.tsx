import { ClipboardList, Clock, Pencil, Trash2, UserCheck, Video } from 'lucide-react'
import { Badge, Card, ProgressBar } from '../../../components/ui'
import type { Procedure } from '../../../mocks/procedures'

interface ProcedureCardProps {
  procedure: Procedure
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ProcedureCard({ procedure, onOpen, onEdit, onDelete }: ProcedureCardProps) {
  const total = procedure.steps.length
  const done = procedure.completedStepIds.length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <Card className="group flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface text-primary transition-transform duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6">
          <ClipboardList size={20} />
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${procedure.title}`}
            className="rounded-md p-1.5 text-text-muted opacity-50 transition-all hover:bg-surface-hover hover:text-primary hover:opacity-100 group-hover:opacity-100"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Excluir ${procedure.title}`}
            className="rounded-md p-1.5 text-text-muted opacity-50 transition-all hover:bg-error-bg hover:text-error hover:opacity-100 group-hover:opacity-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <button type="button" onClick={onOpen} className="mt-3 text-left">
        <p className="line-clamp-2 text-sm font-semibold text-text-primary transition-colors group-hover:text-primary">
          {procedure.title}
        </p>
      </button>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge variant="neutral">{procedure.department}</Badge>
        <Badge variant={procedure.status === 'publicado' ? 'success' : 'warning'}>
          {procedure.status === 'publicado' ? 'Publicado' : 'Rascunho'}
        </Badge>
        {procedure.videoUrl && (
          <Badge variant="primary">
            <Video size={11} />
            Vídeo
          </Badge>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
        <span className="flex items-center gap-1">
          <UserCheck size={12} />
          {procedure.responsible}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {procedure.estimatedMinutes} min
        </span>
      </div>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>
            {done}/{total} etapas concluídas
          </span>
          <span>{progress}%</span>
        </div>
        <ProgressBar value={progress} className="mt-1.5" />
      </div>
    </Card>
  )
}
