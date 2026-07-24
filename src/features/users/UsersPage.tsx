import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Award, Pencil, Plus, PowerOff, Search, Trash2, UserCheck } from 'lucide-react'
import {
  Badge,
  Button,
  ConfirmDialog,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  useToast,
} from '../../components/ui'
import { isSupabase } from '../../lib/dataSource'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import type { ProcedureCompletion } from '../../mocks/procedureCompletions'
import type { Procedure } from '../../mocks/procedures'
import type { TeamMember } from '../../mocks/teamMembers'
import { useAuth } from '../auth/AuthContext'
import type { Role } from '../auth/types'
import { listDepartments } from '../departments/api'
import { listCompletions, listProcedures } from '../procedures/api'
import { createUser, generateInviteCode, listUsers, removeUser, setUserStatus, updateUser, type CreateUserInput } from './api'
import { InviteCodeModal } from './components/InviteCodeModal'
import { UserFormModal } from './components/UserFormModal'
import { UserProgressModal } from './components/UserProgressModal'

const MotionTableRow = motion(TableRow)
const MotionTableBody = motion(TableBody)

const roleLabels: Record<Role, string> = {
  admin: 'Proprietário',
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
  const { user } = useAuth()
  const { toast } = useToast()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('todos')
  const [roleFilter, setRoleFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null)
  const [progressMember, setProgressMember] = useState<TeamMember | null>(null)
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [completions, setCompletions] = useState<ProcedureCompletion[]>([])
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [departments, setDepartments] = useState<string[]>([])

  useEffect(() => {
    Promise.all([listUsers(), listProcedures(), listCompletions(), listDepartments()]).then(([users, procs, comps, depts]) => {
      setMembers(users)
      setProcedures(procs)
      setCompletions(comps)
      setDepartments(depts)
      setLoading(false)
    })
  }, [])

  const filtered = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
    const matchesDept = departmentFilter === 'todos' || m.department === departmentFilter
    const matchesRole = roleFilter === 'todos' || m.role === roleFilter
    const matchesStatus = statusFilter === 'todos' || m.status === statusFilter
    return matchesSearch && matchesDept && matchesRole && matchesStatus
  })

  async function handleCreate(input: CreateUserInput) {
    try {
      if (isSupabase) {
        const code = await generateInviteCode({ role: input.role, department: input.department })
        setGeneratedCode(code)
        return
      }
      const newUser = await createUser(input)
      setMembers((prev) => [newUser, ...prev])
      toast(`${newUser.name} foi adicionado à equipe.`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível criar o usuário.', 'error')
      throw err
    }
  }

  async function handleUpdate(input: CreateUserInput) {
    if (!editingMember) return
    try {
      const updated = await updateUser(editingMember.id, input)
      setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
      toast(`${updated.name} foi atualizado.`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível atualizar o usuário.', 'error')
      throw err
    }
  }

  async function toggleStatus(member: TeamMember) {
    const nextStatus = member.status === 'ativo' ? 'inativo' : 'ativo'
    const updated = await setUserStatus(member.id, nextStatus)
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
    toast(nextStatus === 'ativo' ? `${updated.name} foi ativado.` : `${updated.name} foi desativado.`)
  }

  async function handleDelete() {
    if (!deletingMember) return
    await removeUser(deletingMember.id)
    setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id))
    toast(`${deletingMember.name} foi removido da equipe.`, 'error')
  }

  const departmentOptions = [
    { value: 'todos', label: 'Todos os departamentos' },
    ...departments.map((dept) => ({ value: dept, label: dept })),
  ]
  const roleOptions = [
    { value: 'todos', label: 'Todos os cargos' },
    { value: 'admin', label: 'Proprietário' },
    { value: 'gestor', label: 'Gestor' },
    { value: 'colaborador', label: 'Colaborador' },
  ]
  const statusOptions = [
    { value: 'todos', label: 'Todos os status' },
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' },
  ]

  return (
    <div className="mx-auto max-w-[1400px] p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-text-primary">Gestão de Usuários</h1>
          <p className="mt-1 text-sm text-text-muted">{members.length} colaboradores cadastrados</p>
        </motion.div>
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

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-6 flex flex-wrap items-center gap-3"
      >
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="h-10 w-full rounded-md border border-border bg-surface-card pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
          />
        </div>

        <Select
          value={departmentFilter}
          onChange={setDepartmentFilter}
          options={departmentOptions}
          aria-label="Filtrar por departamento"
        />

        <Select value={roleFilter} onChange={setRoleFilter} options={roleOptions} aria-label="Filtrar por cargo" />

        <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions} aria-label="Filtrar por status" />
      </motion.div>

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
          <MotionTableBody variants={staggerContainer} initial="hidden" animate="show">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-9" />
                  </TableCell>
                </TableRow>
              ))}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <p className="py-8 text-center text-sm text-text-muted">Nenhum colaborador encontrado.</p>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((member) => {
              const isSelf = member.id === user?.id
              return (
              <MotionTableRow
                key={member.id}
                variants={staggerItem}
                layout
                whileHover={{ y: -3, boxShadow: '0 10px 20px -8px rgb(0 0 0 / 0.25)', zIndex: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                style={{ position: 'relative' }}
                className={isSelf ? 'bg-primary/5' : undefined}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -4 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary"
                    >
                      {initialsOf(member.name)}
                    </motion.div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-text-primary">{member.name}</p>
                        {isSelf && <Badge variant="primary">Você</Badge>}
                      </div>
                      <p className="text-xs text-text-muted">{member.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{roleLabels[member.role]}</TableCell>
                <TableCell>{member.department}</TableCell>
                <TableCell>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={member.status}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      className="inline-block"
                    >
                      <Badge variant={member.status === 'ativo' ? 'success' : 'neutral'}>
                        {member.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </motion.span>
                  </AnimatePresence>
                </TableCell>
                <TableCell>
                  <Badge variant="primary">{permissionLabels[member.role]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setProgressMember(member)}
                      aria-label={`Ver progresso de ${member.name}`}
                      className="rounded-md p-2 text-text-muted hover:bg-amber-400/15 hover:text-amber-500"
                    >
                      <Award size={16} />
                    </motion.button>
                    {!isSelf && (
                      <>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => {
                            setEditingMember(member)
                            setModalOpen(true)
                          }}
                          aria-label={`Editar ${member.name}`}
                          className="rounded-md p-2 text-text-muted hover:bg-surface-hover hover:text-text-primary"
                        >
                          <Pencil size={16} />
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => toggleStatus(member)}
                          aria-label={member.status === 'ativo' ? `Desativar ${member.name}` : `Ativar ${member.name}`}
                          className="rounded-md p-2 text-text-muted hover:bg-surface-hover hover:text-text-primary"
                        >
                          {member.status === 'ativo' ? <PowerOff size={16} /> : <UserCheck size={16} />}
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => setDeletingMember(member)}
                          aria-label={`Excluir ${member.name}`}
                          className="rounded-md p-2 text-text-muted hover:bg-error-bg hover:text-error"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </>
                    )}
                  </div>
                </TableCell>
              </MotionTableRow>
              )
            })}
          </MotionTableBody>
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

      <ConfirmDialog
        open={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleDelete}
        title="Remover usuário"
        description={`Tem certeza que deseja remover ${deletingMember?.name} da equipe? O login continua válido, a pessoa só perde acesso a esta empresa.`}
        confirmLabel="Remover"
        variant="destructive"
      />

      <UserProgressModal
        member={progressMember}
        procedures={procedures}
        completions={completions}
        onClose={() => setProgressMember(null)}
      />

      <InviteCodeModal code={generatedCode} onClose={() => setGeneratedCode(null)} />
    </div>
  )
}
