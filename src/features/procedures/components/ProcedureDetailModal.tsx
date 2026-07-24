import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Award, CheckCircle2, ClipboardList, Clock, Download, ExternalLink, Maximize2, Paperclip, Pencil, Trash2, UserCheck, Video, X } from 'lucide-react'
import { Badge, Button, Checkbox, Modal, ProgressBar } from '../../../components/ui'
import { cn } from '../../../lib/cn'
import { staggerContainer, staggerItem } from '../../../lib/motionVariants'
import type { Procedure } from '../../../mocks/procedures'

type FileKind = 'video' | 'image' | 'pdf' | 'other'

function inferFileKind(name: string | undefined): FileKind {
  const ext = name?.split('.').pop()?.toLowerCase() ?? ''
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  return 'other'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function ProcedureDetailModal({
  procedure,
  onClose,
  onToggleStep,
  onToggleVideoWatched,
  onEdit,
  onDelete,
  onComplete,
}: {
  procedure: Procedure | null
  onClose: () => void
  onToggleStep: (procedureId: string, stepId: string) => void
  onToggleVideoWatched: (procedureId: string) => void
  onEdit: (procedure: Procedure) => void
  onDelete: (procedure: Procedure) => void
  onComplete: (procedure: Procedure) => void
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!procedure) return null
  const total = procedure.steps.length
  const done = procedure.completedStepIds.length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0
  const allStepsDone = total > 0 && done === total
  const videoPending = !!procedure.videoUrl && !procedure.videoWatched
  const canComplete = allStepsDone && !videoPending && !procedure.completed
  const fileKind = inferFileKind(procedure.videoName)

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

      {procedure.completed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="mt-4 flex items-center gap-2 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-300"
        >
          <Award size={16} className="shrink-0 text-amber-500" />
          <span>
            Concluído por {procedure.completedBy}
            {procedure.completedAt && ` em ${formatDate(procedure.completedAt)}`}.
          </span>
        </motion.div>
      )}

      {procedure.videoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="mt-5"
        >
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
            {fileKind === 'video' ? <Video size={14} /> : <Paperclip size={14} />}
            {fileKind === 'video' ? 'Vídeo do passo a passo' : 'Arquivo de apoio'}
          </h3>

          {fileKind === 'video' && (
            <video
              key={procedure.videoUrl}
              src={procedure.videoUrl}
              controls
              className="mt-2 aspect-video w-full rounded-md border border-border bg-black"
            />
          )}

          {fileKind === 'image' && (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="mt-2 block w-full cursor-zoom-in overflow-hidden rounded-md border border-border"
              aria-label="Ver imagem em tamanho maior"
            >
              <img key={procedure.videoUrl} src={procedure.videoUrl} alt={procedure.videoName} className="max-h-72 w-full object-contain" />
            </button>
          )}

          {fileKind === 'pdf' && (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="group relative mt-2 block w-full overflow-hidden rounded-md border border-border"
              aria-label="Ver PDF completo"
            >
              <iframe key={procedure.videoUrl} src={procedure.videoUrl} title={procedure.videoName} className="h-64 w-full" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                <span className="flex items-center gap-1.5 rounded-md bg-black/70 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Maximize2 size={12} />
                  Ver completo
                </span>
              </span>
            </button>
          )}

          {fileKind === 'other' && (
            <a
              href={procedure.videoUrl}
              download={procedure.videoName}
              className="mt-2 flex items-center justify-between rounded-md border border-border-strong bg-surface-card px-3 py-2.5 text-sm text-text-primary hover:bg-surface-hover"
            >
              <span>{procedure.videoName}</span>
              <Download size={16} className="shrink-0 text-text-muted" />
            </a>
          )}

          <div className="mt-2 flex items-center gap-2">
            <Checkbox
              id={`${procedure.id}-video-watched`}
              checked={procedure.videoWatched}
              onChange={() => onToggleVideoWatched(procedure.id)}
              aria-label={fileKind === 'video' ? 'Já assisti esse vídeo' : 'Já revisei este arquivo'}
            />
            <label htmlFor={`${procedure.id}-video-watched`} className="cursor-pointer text-sm text-text-secondary">
              {fileKind === 'video' ? 'Já assisti esse vídeo' : 'Já revisei este arquivo'}
            </label>
          </div>
        </motion.div>
      )}

      {procedure.externalLinks && procedure.externalLinks.length > 0 && (
        <div className="mt-5 space-y-2">
          {procedure.externalLinks.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-md border border-border-strong bg-surface px-3 py-2.5 text-sm font-medium text-primary hover:bg-surface-hover"
            >
              <ExternalLink size={16} className="shrink-0" />
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      )}

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

      <div className="mt-6 border-t border-border pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {!procedure.completed && (
              <Button variant="primary" disabled={!canComplete} onClick={() => onComplete(procedure)}>
                <CheckCircle2 size={16} />
                Concluir procedimento
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onEdit(procedure)}>
              <Pencil size={16} />
              Editar
            </Button>
            <Button variant="destructive" onClick={() => onDelete(procedure)}>
              <Trash2 size={16} />
              Excluir procedimento
            </Button>
          </div>
        </div>
        {!procedure.completed && !canComplete && (
          <p className="mt-1.5 text-xs text-text-muted">
            {!allStepsDone
              ? 'Marque todas as etapas para concluir.'
              : videoPending
                ? fileKind === 'video'
                  ? 'Confirme que assistiu o vídeo para concluir.'
                  : 'Confirme que revisou o arquivo para concluir.'
                : null}
          </p>
        )}
      </div>

      {lightboxOpen &&
        procedure.videoUrl &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(0,0,0,0.85)] p-6"
              onClick={() => setLightboxOpen(false)}
            >
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                aria-label="Fechar"
                className="absolute right-4 top-4 rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X size={22} />
              </button>
              {fileKind === 'image' ? (
                <motion.img
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  src={procedure.videoUrl}
                  alt={procedure.videoName}
                  className="max-h-full max-w-full rounded-md object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <motion.iframe
                  initial={{ scale: 0.97, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={procedure.videoUrl}
                  title={procedure.videoName}
                  className="h-full max-h-[85vh] w-full max-w-4xl rounded-md bg-white"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </motion.div>
          </AnimatePresence>,
          window.document.body,
        )}
    </Modal>
  )
}
