import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Bell, Building2, Save, Tags, Trash2, User as UserIcon, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, ConfirmDialog, Input, Modal, Skeleton, Switch, useToast } from '../../components/ui'
import { isSupabase } from '../../lib/dataSource'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { getUserDepartment } from '../../lib/userDepartment'
import type { TeamMember } from '../../mocks/teamMembers'
import type { NotificationType } from '../../mocks/notifications'
import type { Role } from '../auth/types'
import { useAuth } from '../auth/AuthContext'
import { addDepartment, deleteDepartment, listDepartments } from '../departments/api'
import { deleteUser, listUsers } from '../users/api'
import { deleteCompany, getCompany, getNotificationPreferences, setNotificationPreference, updateCompany, updateProfile } from './api'

const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
}

const notificationTypeInfo: Record<NotificationType, { label: string; description: string; roles?: Role[] }> = {
  aviso: { label: 'Avisos', description: 'Quando você recebe um aviso de alguém ou do seu setor.' },
  documento: { label: 'Documentos favoritos', description: 'Quando um documento que você favoritou é atualizado.' },
  'procedimento-publicado': { label: 'Novos procedimentos', description: 'Quando um procedimento é publicado no seu setor.' },
  'procedimento-concluido': {
    label: 'Procedimentos concluídos',
    description: 'Quando alguém conclui um procedimento.',
    roles: ['admin', 'gestor'],
  },
  'novo-usuario': {
    label: 'Novos colaboradores',
    description: 'Quando alguém entra para a equipe.',
    roles: ['admin', 'gestor'],
  },
  'permissao-alterada': {
    label: 'Permissões alteradas',
    description: 'Quando as permissões de um cargo mudam.',
    roles: ['admin'],
  },
}

export function SettingsPage() {
  const { user, setSessionUser, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const department = useMemo(() => getUserDepartment(user) ?? '', [user])

  const [name, setName] = useState(user?.name ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [disabledTypes, setDisabledTypes] = useState<NotificationType[]>([])
  const [loadingPrefs, setLoadingPrefs] = useState(true)

  const [companyName, setCompanyName] = useState('')
  const [savingCompany, setSavingCompany] = useState(false)

  const [allMembers, setAllMembers] = useState<TeamMember[]>([])
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const [confirmingDeleteCompany, setConfirmingDeleteCompany] = useState(false)
  const [deleteCompanyConfirmText, setDeleteCompanyConfirmText] = useState('')
  const [deletingCompany, setDeletingCompany] = useState(false)

  const [departmentsList, setDepartmentsList] = useState<string[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [newDepartment, setNewDepartment] = useState('')
  const [savingDepartment, setSavingDepartment] = useState(false)
  const [removingDepartment, setRemovingDepartment] = useState<string | null>(null)

  useEffect(() => {
    setName(user?.name ?? '')
  }, [user])

  useEffect(() => {
    if (!user) return
    getNotificationPreferences(user.id).then((types) => {
      setDisabledTypes(types)
      setLoadingPrefs(false)
    })
  }, [user])

  useEffect(() => {
    if (user?.role !== 'admin') return
    getCompany().then((c) => {
      setCompanyName(c.name)
    })
  }, [user])

  useEffect(() => {
    listUsers().then(setAllMembers)
  }, [])

  useEffect(() => {
    if (user?.role !== 'admin') return
    listDepartments().then((data) => {
      setDepartmentsList(data)
      setLoadingDepartments(false)
    })
  }, [user])

  const visibleTypes = (Object.keys(notificationTypeInfo) as NotificationType[]).filter((type) => {
    const roles = notificationTypeInfo[type].roles
    return !roles || (user && roles.includes(user.role))
  })

  async function handleSaveProfile() {
    if (!user) return
    setSavingProfile(true)
    const updated = await updateProfile(user.id, { name: name.trim(), email: user.email, role: user.role, department })
    setSessionUser({ ...user, name: updated.name })
    setSavingProfile(false)
    toast('Perfil atualizado.')
  }

  async function handleToggleType(type: NotificationType, enabled: boolean) {
    if (!user) return
    const updated = await setNotificationPreference(user.id, type, enabled)
    setDisabledTypes(updated)
    toast(
      enabled ? `Notificações de "${notificationTypeInfo[type].label}" ativadas.` : `Notificações de "${notificationTypeInfo[type].label}" desativadas.`,
      enabled ? 'success' : 'info',
    )
  }

  async function handleSaveCompany() {
    setSavingCompany(true)
    await updateCompany({ name: companyName.trim() })
    setSavingCompany(false)
    toast('Dados da empresa atualizados.')
  }

  async function handleAddDepartment(e: FormEvent) {
    e.preventDefault()
    if (!newDepartment.trim()) return
    setSavingDepartment(true)
    try {
      const updated = await addDepartment(newDepartment)
      setDepartmentsList(updated)
      setNewDepartment('')
      toast('Departamento adicionado.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível adicionar o departamento.', 'error')
    } finally {
      setSavingDepartment(false)
    }
  }

  async function handleRemoveDepartment(name: string) {
    setRemovingDepartment(name)
    try {
      const updated = await deleteDepartment(name)
      setDepartmentsList(updated)
      toast('Departamento removido.', 'error')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível remover o departamento.', 'error')
    } finally {
      setRemovingDepartment(null)
    }
  }

  async function handleDeleteAccount() {
    if (!user) return
    setDeleting(true)
    await deleteUser(user.id)
    setDeleting(false)
    toast('Sua conta foi excluída.', 'error')
    logout()
    navigate('/login')
  }

  async function handleDeleteCompany() {
    if (!user?.companyId) return
    setDeletingCompany(true)
    try {
      await deleteCompany(user.companyId)
      toast('Empresa excluída.', 'error')
      logout()
      navigate('/login')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível excluir a empresa.', 'error')
    } finally {
      setDeletingCompany(false)
      setConfirmingDeleteCompany(false)
      setDeleteCompanyConfirmText('')
    }
  }

  if (!user) return null

  const adminCount = allMembers.filter((m) => m.role === 'admin').length
  const isOnlyAdmin = user.role === 'admin' && adminCount <= 1

  return (
    <div className="mx-auto max-w-[1040px] p-6 lg:p-8">
      <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text-primary">
        Configurações
      </motion.h1>
      <p className="mt-1 text-sm text-text-muted">Gerencie seu perfil e notificações{user.role === 'admin' ? ', e a empresa' : ''}.</p>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-6 space-y-6">
        <motion.div variants={staggerItem}>
          <Card>
            <div className="flex items-center gap-2">
              <UserIcon size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-text-primary">Meu perfil</h2>
            </div>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="E-mail" value={user.email} disabled hint="O e-mail não pode ser alterado." />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="primary">{roleLabels[user.role]}</Badge>
                <Badge variant="neutral">{department}</Badge>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={savingProfile || !name.trim()}>
                  <Save size={16} />
                  {savingProfile ? 'Salvando...' : 'Salvar perfil'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-text-primary">Notificações</h2>
            </div>
            <p className="mt-1 text-sm text-text-muted">Escolha quais avisos você quer receber no sino de notificações.</p>
            {loadingPrefs ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : (
              <div className="mt-4 divide-y divide-border">
                {visibleTypes.map((type) => (
                  <div key={type} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{notificationTypeInfo[type].label}</p>
                      <p className="text-xs text-text-muted">{notificationTypeInfo[type].description}</p>
                    </div>
                    <Switch checked={!disabledTypes.includes(type)} onChange={(e) => handleToggleType(type, e.target.checked)} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {user.role === 'admin' && (
          <motion.div variants={staggerItem}>
            <Card>
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-primary" />
                <h2 className="text-base font-semibold text-text-primary">Empresa</h2>
              </div>
              <div className="mt-4 space-y-4">
                <Input label="Nome da empresa" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                <div className="flex justify-end">
                  <Button onClick={handleSaveCompany} disabled={savingCompany || !companyName.trim()}>
                    <Save size={16} />
                    {savingCompany ? 'Salvando...' : 'Salvar empresa'}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {user.role === 'admin' && (
          <motion.div variants={staggerItem}>
            <Card>
              <div className="flex items-center gap-2">
                <Tags size={18} className="text-primary" />
                <h2 className="text-base font-semibold text-text-primary">Departamentos</h2>
              </div>
              <p className="mt-1 text-sm text-text-muted">Defina os setores usados ao cadastrar colaboradores, procedimentos e avisos.</p>

              {loadingDepartments ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-24" />
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {departmentsList.map((dept) => (
                    <span
                      key={dept}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface py-0.5 pl-2.5 pr-1.5 text-xs font-semibold text-text-secondary"
                    >
                      {dept}
                      <button
                        type="button"
                        onClick={() => handleRemoveDepartment(dept)}
                        disabled={removingDepartment === dept}
                        aria-label={`Remover ${dept}`}
                        className="rounded-full p-0.5 text-text-muted transition-colors hover:bg-error-bg hover:text-error disabled:pointer-events-none disabled:opacity-50"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  {departmentsList.length === 0 && <p className="text-sm text-text-muted">Nenhum departamento cadastrado.</p>}
                </div>
              )}

              <form onSubmit={handleAddDepartment} className="mt-4 flex gap-2">
                <div className="flex-1">
                  <Input
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="Ex: Marketing"
                    aria-label="Novo departamento"
                  />
                </div>
                <Button type="submit" variant="secondary" disabled={savingDepartment || !newDepartment.trim()}>
                  {savingDepartment ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </form>
            </Card>
          </motion.div>
        )}

        <motion.div variants={staggerItem}>
          <Card className="border-error/30">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-error" />
              <h2 className="text-base font-semibold text-text-primary">Zona de perigo</h2>
            </div>
            <p className="mt-1 text-sm text-text-muted">Excluir sua conta é permanente e não pode ser desfeito.</p>

            {isOnlyAdmin ? (
              <div className="mt-4 flex flex-col items-start gap-3 rounded-md border border-warning/30 bg-warning-bg/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-warning-foreground">
                  Você é o único administrador da empresa. Promova outra pessoa a Admin antes de excluir sua conta.
                </p>
                <Button variant="secondary" onClick={() => navigate('/usuarios')} className="shrink-0">
                  Ir para Usuários
                </Button>
              </div>
            ) : (
              <div className="mt-4 flex justify-end">
                <Button variant="destructive" onClick={() => setConfirmingDelete(true)}>
                  <Trash2 size={16} />
                  Excluir minha conta
                </Button>
              </div>
            )}

            {user.role === 'admin' && isSupabase && (
              <div className="mt-4 flex flex-col items-start gap-3 border-t border-error/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-text-muted">
                  Excluir a empresa apaga todos os dados e as contas de <span className="font-medium text-text-primary">todos os colaboradores</span>, não só a sua.
                </p>
                <Button variant="destructive" onClick={() => setConfirmingDeleteCompany(true)} className="shrink-0">
                  <Trash2 size={16} />
                  Excluir empresa
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      <ConfirmDialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={handleDeleteAccount}
        title="Excluir sua conta"
        description="Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita e você será desconectado."
        confirmLabel={deleting ? 'Excluindo...' : 'Excluir conta'}
        variant="destructive"
      />

      <Modal
        open={confirmingDeleteCompany}
        onClose={() => {
          setConfirmingDeleteCompany(false)
          setDeleteCompanyConfirmText('')
        }}
        title="Excluir empresa"
        description="Essa ação é permanente: apaga a empresa, todos os documentos, procedimentos e avisos, e a conta de login de todos os colaboradores — inclusive a sua."
        className="max-w-sm"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">
              Digite <span className="font-semibold">{companyName}</span> para confirmar
            </label>
            <Input value={deleteCompanyConfirmText} onChange={(e) => setDeleteCompanyConfirmText(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setConfirmingDeleteCompany(false)
                setDeleteCompanyConfirmText('')
              }}
              disabled={deletingCompany}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteCompany}
              disabled={deletingCompany || deleteCompanyConfirmText.trim() !== companyName.trim()}
            >
              {deletingCompany ? 'Excluindo...' : 'Excluir empresa'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
