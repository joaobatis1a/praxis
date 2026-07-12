import { procedures as initialProcedures, type Procedure, type ProcedureStatus, type ProcedureStep } from '../../mocks/procedures'

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let procedures: Procedure[] = structuredClone(initialProcedures)

export interface CreateProcedureInput {
  title: string
  department: string
  responsible: string
  status: ProcedureStatus
  estimatedMinutes: number
  author: string
  steps: string[]
  videoUrl?: string
  videoName?: string
}

export interface UpdateProcedureInput {
  title: string
  department: string
  responsible: string
  status: ProcedureStatus
  estimatedMinutes: number
  steps: string[]
  videoUrl?: string
  videoName?: string
}

export function listProcedures(): Promise<Procedure[]> {
  return delay([...procedures])
}

export function toggleStep(procedureId: string, stepId: string): Promise<Procedure> {
  const proc = procedures.find((p) => p.id === procedureId)
  if (!proc) throw new Error('Procedimento não encontrado')
  proc.completedStepIds = proc.completedStepIds.includes(stepId)
    ? proc.completedStepIds.filter((id) => id !== stepId)
    : [...proc.completedStepIds, stepId]
  return delay(proc)
}

export function createProcedure(input: CreateProcedureInput): Promise<Procedure> {
  const id = `proc-${Date.now()}`
  const steps: ProcedureStep[] = input.steps.map((text, i) => ({ id: `${id}-s${i + 1}`, text }))
  const newProcedure: Procedure = {
    id,
    title: input.title,
    department: input.department,
    responsible: input.responsible,
    status: input.status,
    estimatedMinutes: input.estimatedMinutes,
    updatedAt: new Date().toISOString().slice(0, 10),
    author: input.author,
    steps,
    completedStepIds: [],
    videoUrl: input.videoUrl,
    videoName: input.videoName,
  }
  procedures = [newProcedure, ...procedures]
  return delay(newProcedure)
}

export function updateProcedure(id: string, input: UpdateProcedureInput): Promise<Procedure> {
  const existing = procedures.find((p) => p.id === id)
  if (!existing) throw new Error('Procedimento não encontrado')
  const steps: ProcedureStep[] = input.steps.map((text, i) => {
    const previous = existing.steps[i]
    return { id: previous?.id ?? `${id}-s${i + 1}`, text }
  })
  const validStepIds = new Set(steps.map((s) => s.id))
  const updated: Procedure = {
    ...existing,
    title: input.title,
    department: input.department,
    responsible: input.responsible,
    status: input.status,
    estimatedMinutes: input.estimatedMinutes,
    steps,
    completedStepIds: existing.completedStepIds.filter((stepId) => validStepIds.has(stepId)),
    updatedAt: new Date().toISOString().slice(0, 10),
    videoUrl: input.videoUrl,
    videoName: input.videoName,
  }
  procedures = procedures.map((p) => (p.id === id ? updated : p))
  return delay(updated)
}

export function deleteProcedure(id: string): Promise<void> {
  procedures = procedures.filter((p) => p.id !== id)
  return delay(undefined)
}
