import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { procedures as initialProcedures, type Procedure, type ProcedureStatus, type ProcedureStep } from '../../mocks/procedures'
import { procedureCompletions as initialCompletions, type ProcedureCompletion } from '../../mocks/procedureCompletions'
import { notify } from '../notifications/api'

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let procedures: Procedure[] = structuredClone(initialProcedures)
let completions: ProcedureCompletion[] = structuredClone(initialCompletions)

const VIDEO_BUCKET = 'procedure-videos'
const SIGNED_URL_TTL = 60 * 60

interface ProcedureRow {
  id: string
  title: string
  department: string
  responsible: string
  status: ProcedureStatus
  estimated_minutes: number
  updated_at: string
  author: string
  steps: ProcedureStep[]
  completed_step_ids: string[]
  video_path: string | null
  video_name: string | null
  external_url: string | null
  video_watched: boolean
  completed: boolean
  completed_at: string | null
  completed_by: string | null
}

interface CompletionRow {
  id: string
  procedure_id: string
  procedure_title: string
  user_id: string
  user_name: string
  completed_at: string
}

async function rowToProcedure(row: ProcedureRow): Promise<Procedure> {
  let videoUrl: string | undefined
  if (row.video_path) {
    const { data } = await supabase!.storage.from(VIDEO_BUCKET).createSignedUrl(row.video_path, SIGNED_URL_TTL)
    videoUrl = data?.signedUrl
  }
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    responsible: row.responsible,
    status: row.status,
    estimatedMinutes: row.estimated_minutes,
    updatedAt: row.updated_at,
    author: row.author,
    steps: row.steps,
    completedStepIds: row.completed_step_ids,
    videoUrl,
    videoName: row.video_name ?? undefined,
    externalUrl: row.external_url ?? undefined,
    videoWatched: row.video_watched,
    completed: row.completed,
    completedAt: row.completed_at ?? undefined,
    completedBy: row.completed_by ?? undefined,
  }
}

function rowToCompletion(row: CompletionRow): ProcedureCompletion {
  return {
    id: row.id,
    procedureId: row.procedure_id,
    procedureTitle: row.procedure_title,
    userId: row.user_id,
    userName: row.user_name,
    completedAt: row.completed_at,
  }
}

async function fetchOwnCompanyId(): Promise<string> {
  const { data, error } = await supabase!.from('companies').select('id').single()
  if (error || !data) throw new Error('Não foi possível carregar a empresa.')
  return (data as { id: string }).id
}

async function uploadVideo(procedureId: string, file: File): Promise<{ path: string; name: string }> {
  const companyId = await fetchOwnCompanyId()
  const ext = file.name.split('.').pop()
  const path = `${companyId}/${procedureId}-${Date.now()}${ext ? `.${ext}` : ''}`
  const { error } = await supabase!.storage.from(VIDEO_BUCKET).upload(path, file, { contentType: file.type })
  if (error) throw new Error(`Não foi possível enviar o arquivo: ${error.message}`)
  return { path, name: file.name }
}

async function deleteVideo(path: string) {
  await supabase!.storage.from(VIDEO_BUCKET).remove([path])
}

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
  videoFile?: File
  externalUrl?: string
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
  videoFile?: File
  externalUrl?: string
}

export async function listProcedures(): Promise<Procedure[]> {
  if (isSupabase) {
    const { data, error } = await supabase!.from('procedures').select('*').order('updated_at', { ascending: false })
    if (error || !data) throw new Error('Não foi possível carregar os procedimentos.')
    return Promise.all((data as ProcedureRow[]).map(rowToProcedure))
  }
  return delay([...procedures])
}

export async function toggleStep(procedureId: string, stepId: string): Promise<Procedure> {
  if (isSupabase) {
    const { data: current, error: fetchError } = await supabase!
      .from('procedures')
      .select('completed_step_ids')
      .eq('id', procedureId)
      .single()
    if (fetchError || !current) throw new Error('Procedimento não encontrado.')
    const ids = (current as { completed_step_ids: string[] }).completed_step_ids
    const updatedIds = ids.includes(stepId) ? ids.filter((id) => id !== stepId) : [...ids, stepId]
    const { data, error } = await supabase!
      .from('procedures')
      .update({ completed_step_ids: updatedIds })
      .eq('id', procedureId)
      .select()
      .single()
    if (error || !data) throw new Error('Não foi possível atualizar a etapa.')
    return rowToProcedure(data as ProcedureRow)
  }
  const proc = procedures.find((p) => p.id === procedureId)
  if (!proc) throw new Error('Procedimento não encontrado')
  proc.completedStepIds = proc.completedStepIds.includes(stepId)
    ? proc.completedStepIds.filter((id) => id !== stepId)
    : [...proc.completedStepIds, stepId]
  return delay(proc)
}

export async function toggleVideoWatched(procedureId: string): Promise<Procedure> {
  if (isSupabase) {
    const { data: current, error: fetchError } = await supabase!
      .from('procedures')
      .select('video_watched')
      .eq('id', procedureId)
      .single()
    if (fetchError || !current) throw new Error('Procedimento não encontrado.')
    const { data, error } = await supabase!
      .from('procedures')
      .update({ video_watched: !(current as { video_watched: boolean }).video_watched })
      .eq('id', procedureId)
      .select()
      .single()
    if (error || !data) throw new Error('Não foi possível atualizar o vídeo.')
    return rowToProcedure(data as ProcedureRow)
  }
  const proc = procedures.find((p) => p.id === procedureId)
  if (!proc) throw new Error('Procedimento não encontrado')
  proc.videoWatched = !proc.videoWatched
  return delay(proc)
}

export async function createProcedure(input: CreateProcedureInput): Promise<Procedure> {
  if (isSupabase) {
    const steps: ProcedureStep[] = input.steps.map((text, i) => ({ id: `s${i + 1}`, text }))
    const { data: inserted, error } = await supabase!
      .from('procedures')
      .insert({
        title: input.title,
        department: input.department,
        responsible: input.responsible,
        status: input.status,
        estimated_minutes: input.estimatedMinutes,
        author: input.author,
        steps,
        external_url: input.externalUrl || null,
        updated_at: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single()
    if (error || !inserted) throw new Error('Não foi possível criar o procedimento.')
    let row = inserted as ProcedureRow
    if (input.videoFile) {
      const { path, name } = await uploadVideo(row.id, input.videoFile)
      const { data: updated, error: updateError } = await supabase!
        .from('procedures')
        .update({ video_path: path, video_name: name })
        .eq('id', row.id)
        .select()
        .single()
      if (updateError || !updated) throw new Error('Não foi possível salvar o vídeo do procedimento.')
      row = updated as ProcedureRow
    }
    const newProcedure = await rowToProcedure(row)
    if (newProcedure.status === 'publicado') {
      notify({
        type: 'procedimento-publicado',
        title: 'Novo procedimento publicado',
        description: `"${newProcedure.title}" foi publicado para ${newProcedure.department}`,
        targetDepartment: newProcedure.department,
        targetRoles: ['admin'],
        linkTo: '/procedimentos',
      })
    }
    return newProcedure
  }

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
    externalUrl: input.externalUrl,
    videoWatched: false,
    completed: false,
  }
  procedures = [newProcedure, ...procedures]
  if (newProcedure.status === 'publicado') {
    notify({
      type: 'procedimento-publicado',
      title: 'Novo procedimento publicado',
      description: `"${newProcedure.title}" foi publicado para ${newProcedure.department}`,
      targetDepartment: newProcedure.department,
      targetRoles: ['admin'],
      linkTo: '/procedimentos',
    })
  }
  return delay(newProcedure)
}

export async function updateProcedure(id: string, input: UpdateProcedureInput): Promise<Procedure> {
  if (isSupabase) {
    const { data: current, error: fetchError } = await supabase!
      .from('procedures')
      .select('video_path, steps')
      .eq('id', id)
      .single()
    if (fetchError || !current) throw new Error('Procedimento não encontrado.')
    const currentRow = current as { video_path: string | null; steps: ProcedureStep[] }
    const steps: ProcedureStep[] = input.steps.map((text, i) => {
      const previous = currentRow.steps[i]
      return { id: previous?.id ?? `s${i + 1}`, text }
    })

    const payload: Record<string, unknown> = {
      title: input.title,
      department: input.department,
      responsible: input.responsible,
      status: input.status,
      estimated_minutes: input.estimatedMinutes,
      steps,
      external_url: input.externalUrl || null,
      // editing invalidates any in-progress or completed execution, so it always resets
      completed_step_ids: [],
      video_watched: false,
      completed: false,
      completed_at: null,
      completed_by: null,
      updated_at: new Date().toISOString().slice(0, 10),
    }

    if (input.videoFile) {
      const { path, name } = await uploadVideo(id, input.videoFile)
      if (currentRow.video_path) await deleteVideo(currentRow.video_path)
      payload.video_path = path
      payload.video_name = name
    } else if (!input.videoName) {
      if (currentRow.video_path) await deleteVideo(currentRow.video_path)
      payload.video_path = null
      payload.video_name = null
    }
    // else: videoName is set but no new file was chosen — existing video stays untouched

    const { data, error } = await supabase!.from('procedures').update(payload).eq('id', id).select().single()
    if (error || !data) throw new Error('Não foi possível atualizar o procedimento.')
    return rowToProcedure(data as ProcedureRow)
  }

  const existing = procedures.find((p) => p.id === id)
  if (!existing) throw new Error('Procedimento não encontrado')
  const steps: ProcedureStep[] = input.steps.map((text, i) => {
    const previous = existing.steps[i]
    return { id: previous?.id ?? `${id}-s${i + 1}`, text }
  })
  const updated: Procedure = {
    ...existing,
    title: input.title,
    department: input.department,
    responsible: input.responsible,
    status: input.status,
    estimatedMinutes: input.estimatedMinutes,
    steps,
    completedStepIds: [],
    videoWatched: false,
    completed: false,
    completedAt: undefined,
    completedBy: undefined,
    updatedAt: new Date().toISOString().slice(0, 10),
    videoUrl: input.videoUrl,
    videoName: input.videoName,
    externalUrl: input.externalUrl,
  }
  procedures = procedures.map((p) => (p.id === id ? updated : p))
  return delay(updated)
}

export async function deleteProcedure(id: string): Promise<void> {
  if (isSupabase) {
    const { data: current } = await supabase!.from('procedures').select('video_path').eq('id', id).single()
    const videoPath = (current as { video_path: string | null } | null)?.video_path
    const { error } = await supabase!.from('procedures').delete().eq('id', id)
    if (error) throw new Error('Não foi possível remover o procedimento.')
    if (videoPath) await deleteVideo(videoPath)
    return
  }
  procedures = procedures.filter((p) => p.id !== id)
  return delay(undefined)
}

export async function listCompletions(): Promise<ProcedureCompletion[]> {
  if (isSupabase) {
    const { data, error } = await supabase!.from('procedure_completions').select('*').order('completed_at', { ascending: false })
    if (error || !data) throw new Error('Não foi possível carregar as conclusões.')
    return (data as CompletionRow[]).map(rowToCompletion)
  }
  return delay([...completions])
}

export async function completeProcedure(
  procedureId: string,
  userId: string,
  userName: string,
): Promise<{ procedure: Procedure; completion: ProcedureCompletion }> {
  if (isSupabase) {
    const { data: procRow, error: procFetchError } = await supabase!.from('procedures').select('title').eq('id', procedureId).single()
    if (procFetchError || !procRow) throw new Error('Procedimento não encontrado.')
    const completedAt = new Date().toISOString()
    const { data: updatedProc, error: updateError } = await supabase!
      .from('procedures')
      .update({ completed: true, completed_at: completedAt, completed_by: userName })
      .eq('id', procedureId)
      .select()
      .single()
    if (updateError || !updatedProc) throw new Error('Não foi possível concluir o procedimento.')
    const { data: completionRow, error: completionError } = await supabase!
      .from('procedure_completions')
      .insert({
        procedure_id: procedureId,
        procedure_title: (procRow as { title: string }).title,
        user_name: userName,
        completed_at: completedAt,
      })
      .select()
      .single()
    if (completionError || !completionRow) throw new Error('Não foi possível registrar a conclusão.')
    notify({
      type: 'procedimento-concluido',
      title: 'Procedimento concluído',
      description: `${userName} concluiu "${(procRow as { title: string }).title}"`,
      targetRoles: ['gestor', 'admin'],
      linkTo: '/procedimentos',
    })
    const procedure = await rowToProcedure(updatedProc as ProcedureRow)
    const completion = rowToCompletion(completionRow as CompletionRow)
    return { procedure, completion }
  }

  const proc = procedures.find((p) => p.id === procedureId)
  if (!proc) throw new Error('Procedimento não encontrado')
  const completedAt = new Date().toISOString()
  const completion: ProcedureCompletion = {
    id: `comp-${Date.now()}`,
    procedureId: proc.id,
    procedureTitle: proc.title,
    userId,
    userName,
    completedAt,
  }
  completions = [completion, ...completions]
  proc.completed = true
  proc.completedAt = completedAt
  proc.completedBy = userName
  notify({
    type: 'procedimento-concluido',
    title: 'Procedimento concluído',
    description: `${userName} concluiu "${proc.title}"`,
    targetRoles: ['gestor', 'admin'],
    linkTo: '/procedimentos',
  })
  return delay({ procedure: proc, completion })
}
