import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import type { Procedure } from '../../mocks/procedures'
import { Button, ConfirmDialog, Select, Skeleton, useToast } from '../../components/ui'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { useAuth } from '../auth/AuthContext'
import { listDepartments } from '../departments/api'
import { completeProcedure, createProcedure, deleteProcedure, listProcedures, toggleStep, toggleVideoWatched, updateProcedure } from './api'
import { ProcedureCard } from './components/ProcedureCard'
import { ProcedureDetailModal } from './components/ProcedureDetailModal'
import { ProcedureFormModal, type ProcedureFormValues } from './components/ProcedureFormModal'

type FormState = { mode: 'create' } | { mode: 'edit'; procedure: Procedure } | null

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'rascunho', label: 'Rascunho' },
]

export function ProceduresPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentOptions, setDepartmentOptions] = useState([{ value: 'all', label: 'Todos os departamentos' }])
  const [openProcedure, setOpenProcedure] = useState<Procedure | null>(null)
  const [formState, setFormState] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<Procedure | null>(null)
  const [completing, setCompleting] = useState<Procedure | null>(null)

  useEffect(() => {
    listProcedures().then((data) => {
      setProcedures(data)
      setLoading(false)
    })
    listDepartments().then((data) => {
      setDepartmentOptions([{ value: 'all', label: 'Todos os departamentos' }, ...data.map((d) => ({ value: d, label: d }))])
    })
  }, [])

  const visibleProcedures = useMemo(() => {
    return procedures.filter((p) => {
      if (search.trim() && !p.title.toLowerCase().includes(search.toLowerCase())) return false
      if (departmentFilter !== 'all' && p.department !== departmentFilter) return false
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      return true
    })
  }, [procedures, search, departmentFilter, statusFilter])

  async function handleToggleStep(procedureId: string, stepId: string) {
    try {
      const updated = await toggleStep(procedureId, stepId)
      setProcedures((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setOpenProcedure((prev) => (prev && prev.id === updated.id ? updated : prev))
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível atualizar a etapa.', 'error')
    }
  }

  async function handleToggleVideoWatched(procedureId: string) {
    try {
      const updated = await toggleVideoWatched(procedureId)
      setProcedures((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setOpenProcedure((prev) => (prev && prev.id === updated.id ? updated : prev))
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível atualizar o vídeo.', 'error')
    }
  }

  async function handleFormSubmit(values: ProcedureFormValues) {
    try {
      if (formState?.mode === 'edit') {
        const updated = await updateProcedure(formState.procedure.id, values)
        setProcedures((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        setOpenProcedure((prev) => (prev && prev.id === updated.id ? updated : prev))
        toast(`${updated.title} foi atualizado.`)
      } else {
        const newProcedure = await createProcedure({ ...values, author: user?.name ?? 'Você' })
        setProcedures((prev) => [newProcedure, ...prev])
        toast(`${newProcedure.title} foi criado.`)
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível salvar o procedimento.', 'error')
      throw err
    }
  }

  async function handleDelete() {
    if (!deleting) return
    await deleteProcedure(deleting.id)
    setProcedures((prev) => prev.filter((p) => p.id !== deleting.id))
    setOpenProcedure(null)
    toast(`${deleting.title} foi excluído.`, 'error')
  }

  async function handleComplete() {
    if (!completing || !user) return
    const { procedure: updated } = await completeProcedure(completing.id, user.id, user.name)
    setProcedures((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setOpenProcedure(null)
    toast(`${completing.title} foi concluído! Isso já apareceu no dashboard.`)
  }

  const editingInitialData: ProcedureFormValues | undefined =
    formState?.mode === 'edit'
      ? {
          title: formState.procedure.title,
          department: formState.procedure.department,
          responsible: formState.procedure.responsible,
          status: formState.procedure.status,
          estimatedMinutes: formState.procedure.estimatedMinutes,
          steps: formState.procedure.steps.map((s) => ({ id: s.id, text: s.text })),
          videoUrl: formState.procedure.videoUrl,
          videoName: formState.procedure.videoName,
          externalLinks: formState.procedure.externalLinks,
        }
      : undefined

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Procedimentos Operacionais</h1>
          <p className="mt-1 text-sm text-text-muted">{procedures.length} procedimentos cadastrados</p>
        </div>
        <Button onClick={() => setFormState({ mode: 'create' })}>
          <Plus size={16} />
          Novo procedimento
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative max-w-xl flex-1">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar procedimentos..."
            className="h-12 w-full rounded-lg border border-border bg-surface-card pl-11 pr-4 text-sm text-text-primary shadow-[var(--shadow-level-1)] placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
          />
        </div>
        {user?.role === 'admin' && (
          <Select value={departmentFilter} onChange={setDepartmentFilter} options={departmentOptions} aria-label="Filtrar por departamento" />
        )}
        <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions} aria-label="Filtrar por status" />
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        ) : visibleProcedures.length === 0 ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-sm text-text-muted">
            Nenhum procedimento encontrado.
          </motion.p>
        ) : (
          <motion.div
            key={`${departmentFilter}-${statusFilter}-${search}`}
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {visibleProcedures.map((procedure) => (
                <motion.div key={procedure.id} variants={staggerItem} exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }} layout>
                  <ProcedureCard
                    procedure={procedure}
                    onOpen={() => setOpenProcedure(procedure)}
                    onEdit={() => setFormState({ mode: 'edit', procedure })}
                    onDelete={() => setDeleting(procedure)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <ProcedureDetailModal
        procedure={openProcedure}
        onClose={() => setOpenProcedure(null)}
        onToggleStep={handleToggleStep}
        onToggleVideoWatched={handleToggleVideoWatched}
        onEdit={(procedure) => setFormState({ mode: 'edit', procedure })}
        onDelete={setDeleting}
        onComplete={setCompleting}
      />

      <ProcedureFormModal
        open={!!formState}
        onClose={() => setFormState(null)}
        onSubmit={handleFormSubmit}
        initialData={editingInitialData}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Excluir procedimento"
        description={`Tem certeza que deseja excluir "${deleting?.title}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
      />

      <ConfirmDialog
        open={!!completing}
        onClose={() => setCompleting(null)}
        onConfirm={handleComplete}
        title="Concluir procedimento"
        description={`Isso marca "${completing?.title}" como concluído, destaca o card e registra a conclusão no dashboard.`}
        confirmLabel="Concluir"
        variant="primary"
      />
    </div>
  )
}
