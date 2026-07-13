import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { initialDepartments } from '../../mocks/departments'
import { listProcedures } from '../procedures/api'
import { listUsers } from '../users/api'

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let departmentsState = [...initialDepartments]

export async function listDepartments(): Promise<string[]> {
  if (isSupabase) {
    const { data, error } = await supabase!.from('departments').select('name').order('name')
    if (error || !data) throw new Error('Não foi possível carregar os departamentos.')
    return (data as { name: string }[]).map((d) => d.name)
  }
  return delay([...departmentsState])
}

export async function addDepartment(name: string): Promise<string[]> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Informe um nome para o departamento.')

  if (isSupabase) {
    const { error } = await supabase!.from('departments').insert({ name: trimmed })
    if (error) throw new Error(error.code === '23505' ? 'Esse departamento já existe.' : 'Não foi possível criar o departamento.')
    return listDepartments()
  }

  if (departmentsState.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('Esse departamento já existe.')
  }
  departmentsState = [...departmentsState, trimmed].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  return delay([...departmentsState])
}

export async function deleteDepartment(name: string): Promise<string[]> {
  const [users, procedures] = await Promise.all([listUsers(), listProcedures()])
  const usersInUse = users.filter((u) => u.department === name).length
  if (usersInUse > 0) {
    throw new Error(`${usersInUse} colaborador(es) usam esse departamento. Mude o departamento deles antes de excluir.`)
  }
  const proceduresInUse = procedures.filter((p) => p.department === name).length
  if (proceduresInUse > 0) {
    throw new Error(`${proceduresInUse} procedimento(s) usam esse departamento. Mude o departamento deles antes de excluir.`)
  }

  if (isSupabase) {
    const { error } = await supabase!.from('departments').delete().eq('name', name)
    if (error) throw new Error('Não foi possível excluir o departamento.')
    return listDepartments()
  }

  departmentsState = departmentsState.filter((d) => d !== name)
  return delay([...departmentsState])
}
