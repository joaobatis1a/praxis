import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, PowerOff, Search, UserCheck } from 'lucide-react'
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../../components/ui'
import type { TeamMember } from '../../mocks/teamMembers'
import type { Role } from '../auth/types'
import { createUser, listUsers, setUserStatus, updateUser, type CreateUserInput } from './api'
import { UserFormModal } from './components/UserFormModal'

const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
}

const permissionLabels: Record<Role, string> = {
  admin: 'Acesso total',
  gestor: 'Gestão de equipe',
  colaborador: 'Padrão',
}

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function UsersPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('todos')
  const [roleFilter, setRoleFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  useEffect(() => {
    listUsers().then((data) => {
      setMembers(data)
      setLoading(false)
    })
  }, [])

  const departments = useMemo(() => Array.from(new Set(members.map((m) => m.department))).sort(), [members])

  const filtered = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
    const matchesDept = departmentFilter === 'todos' || m.department === departmentFilter
    const matchesRole = roleFilter === 'todos' || m.role === roleFilter
    const matchesStatus = statusFilter === 'todos' || m.status === statusFilter
    return matchesSearch && matchesDept && matchesRole && matchesStatus
  })

  async function handleCreate(input: CreateUserInput) {
    const newUser = await createUser(input)
    setMembers((prev) => [newUser, ...prev])
  }

  async function handleUpdate(input: CreateUserInput) {
    if (!editingMember) return
    const updated = await updateUser(editingMember.id, input)
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
  }

  async function toggleStatus(member: TeamMember) {
    const nextStatus = member.status === 'ativo' ? 'inativo' : 'ativo'
    const updated = await setUserStatus(member.id, nextStatus)
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
  }

  const selectClass =
    'h-10 rounded-md border border-border bg-surface-card px-3 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20'

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Gestão de Usuários</h1>
          <p className="mt-1 text-sm text-text-muted">{members.length} colaboradores cadastrados</p>
        </div>
        <Button
          onClick={() => {
            setEditingMember(null)
            setModalOpen(true)
          }}
        >
          <Plus size={16} />
          Criar usuário
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="h-10 w-full rounded-md border border-border bg-surface-card pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
          />
        </div>

        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className={selectClass}>
          <option value="todos">Todos os departamentos</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectClass}>
          <option value="todos">Todos os cargos</option>
          <option value="admin">Administrador</option>
          <option value="gestor">Gestor</option>
          <option value="colaborador">Colaborador</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      <div className="mt-6">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Colaborador</TableHeaderCell>
              <TableHeaderCell>Cargo</TableHeaderCell>
              <TableHeaderCell>Departamento</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Permissões</TableHeaderCell>
              <TableHeaderCell className="text-right">Ações</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <p className="py-8 text-center text-sm text-text-muted">Nenhum colaborador encontrado.</p>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                      {initialsOf(member.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">{member.name}</p>
                      <p className="truncate text-xs text-text-muted">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{roleLabels[member.role]}</TableCell>
                <TableCell>{member.department}</TableCell>
                <TableCell>
                  <Badge variant={member.status === 'ativo' ? 'success' : 'neutral'}>
                    {member.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="primary">{permissionLabels[member.role]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMember(member)
                        setModalOpen(true)
                      }}
                      aria-label={`Editar ${member.name}`}
                      className="rounded-md p-2 text-text-muted hover:bg-surface-hover hover:text-text-primary"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(member)}
                      aria-label={member.status === 'ativo' ? `Desativar ${member.name}` : `Ativar ${member.name}`}
                      className="rounded-md p-2 text-text-muted hover:bg-surface-hover hover:text-text-primary"
                    >
                      {member.status === 'ativo' ? <PowerOff size={16} /> : <UserCheck size={16} />}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editingMember ? handleUpdate : handleCreate}
        initialData={
          editingMember
            ? {
                name: editingMember.name,
                email: editingMember.email,
                role: editingMember.role,
                department: editingMember.department,
              }
            : undefined
        }
      />
    </div>
  )
}
