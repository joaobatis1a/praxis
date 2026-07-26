import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Bell, Building2, Camera, Image, LogOut, Save, Tags, Trash2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, ConfirmDialog, ImageCropModal, Input, Modal, Skeleton, Switch, useToast } from '../../components/ui'
import { isSupabase } from '../../lib/dataSource'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import type { TeamMember } from '../../mocks/teamMembers'
import type { NotificationType } from '../../mocks/notifications'
import type { Role } from '../auth/types'
import { useAuth } from '../auth/AuthContext'
import { addDepartment, deleteDepartment, listDepartments } from '../departments/api'
import { deleteUser, listUsers } from '../users/api'
import {
  deleteCompany,
  getCompany,
  getNotificationPreferences,
  leaveCompany,
  removeCompanyLogo,
  setNotificationPreference,
  updateCompany,
  uploadCompanyLogo,
} from './api'

function CompanyLogoField({
  companyId,
  logoUrl,
  onUpdated,
}: {
  companyId: string
  logoUrl: string | null
  onUpdated: (logoUrl: string | null) => void
}) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [viewing, setViewing] = useState(false)
  const [cropFile, setCropFile] = useState<File | null>(null)

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setCropFile(file)
  }

  async function handleCropConfirm(file: File) {
    setCropFile(null)
    setUploading(true)
    try {
      const url = await uploadCompanyLogo(companyId, file)
      onUpdated(url)
      toast('Logo atualizada.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível enviar a logo.', 'error')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    setMenuOpen(false)
    setUploading(true)
    try {
      await removeCompanyLogo(companyId)
      onUpdated(null)
      toast('Logo removida.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível remover a logo.', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative inline-block">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo da empresa" className="h-full w-full object-contain p-1.5" />
        ) : (
          <Building2 size={22} className="text-text-muted" />
        )}
      </div>
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        disabled={uploading}
        aria-label="Opções da logo da empresa"
        className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface-card bg-primary text-white transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
      >
        <Camera size={12} />
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      <AnimatePresence>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.12 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="absolute left-0 top-full z-20 mt-2 w-44 rounded-lg border border-border bg-surface-card p-1.5 shadow-[var(--shadow-level-2)]"
            >
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setViewing(true)
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                >
                  <Image size={16} />
                  Ver logo
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  inputRef.current?.click()
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              >
                <Camera size={16} />
                {logoUrl ? 'Trocar logo' : 'Enviar logo'}
              </button>
              {logoUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-error hover:bg-error-bg"
                >
                  <Trash2 size={16} />
                  Remover logo
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal open={viewing} onClose={() => setViewing(false)} title="Logo da empresa">
        {logoUrl && <img src={logoUrl} alt="Logo da empresa" className="mx-auto max-h-[60vh] w-auto rounded-md object-contain" />}
      </Modal>

      <ImageCropModal
        file={cropFile}
        open={!!cropFile}
        onCancel={() => setCropFile(null)}
        onConfirm={handleCropConfirm}
        shape="square"
        title="Ajustar logo da empresa"
      />
    </div>
  )
}

const notificationTypeInfo: Record<NotificationType, { label: string; description: string; roles?: Role[] }> = {
  aviso: { label: 'Avisos', description: 'Quando você recebe um aviso de alguém ou do seu setor.' },
  'aviso-respondido': { label: 'Respostas de avisos', description: 'Quando alguém responde a um aviso que você enviou.' },
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
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [disabledTypes, setDisabledTypes] = useState<NotificationType[]>([])
  const [loadingPrefs, setLoadingPrefs] = useState(true)

  const [companyName, setCompanyName] = useState('')
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null)
  const [savingCompany, setSavingCompany] = useState(false)

  const [allMembers, setAllMembers] = useState<TeamMember[]>([])
  const [deleting, setDeleting] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const [confirmingDeleteCompany, setConfirmingDeleteCompany] = useState(false)
  const [deleteCompanyConfirmText, setDeleteCompanyConfirmText] = useState('')
  const [deletingCompany, setDeletingCompany] = useState(false)

  const [confirmingLeaveCompany, setConfirmingLeaveCompany] = useState(false)
  const [leavingCompany, setLeavingCompany] = useState(false)

  const [departmentsList, setDepartmentsList] = useState<string[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [newDepartment, setNewDepartment] = useState('')
  const [savingDepartment, setSavingDepartment] = useState(false)
  const [removingDepartment, setRemovingDepartment] = useState<string | null>(null)

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
      setCompanyLogoUrl(c.logoUrl ?? null)
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

  async function handleLeaveCompany() {
    setLeavingCompany(true)
    try {
      await leaveCompany()
      toast('Você saiu da empresa.')
      logout()
      navigate('/login')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível sair da empresa.', 'error')
    } finally {
      setLeavingCompany(false)
      setConfirmingLeaveCompany(false)
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
      <p className="mt-1 text-sm text-text-muted">Gerencie notificações{user.role === 'admin' ? ', a empresa e os departamentos' : ''}.</p>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-6 space-y-6">
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
                {isSupabase && user.companyId && (
                  <CompanyLogoField companyId={user.companyId} logoUrl={companyLogoUrl} onUpdated={setCompanyLogoUrl} />
                )}
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

            {isOnlyAdmin && (
              <div className="mt-4 flex flex-col items-start gap-3 rounded-md border border-warning/30 bg-warning-bg/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-warning-foreground">
                  Você é o único administrador. Promova outra pessoa antes de sair ou excluir sua conta.
                </p>
                <Button variant="secondary" onClick={() => navigate('/usuarios')} className="shrink-0">
                  Ir para Usuários
                </Button>
              </div>
            )}

            <div className="mt-4 divide-y divide-error/15">
              {isSupabase && !isOnlyAdmin && (
                <div className="flex flex-col items-start gap-3 py-3.5 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Sair da empresa</p>
                    <p className="text-xs text-text-muted">Seu login continua ativo.</p>
                  </div>
                  <Button variant="secondary" onClick={() => setConfirmingLeaveCompany(true)} className="shrink-0">
                    <LogOut size={16} />
                    Sair
                  </Button>
                </div>
              )}

              {user.role === 'admin' && isSupabase && (
                <div className="flex flex-col items-start gap-3 py-3.5 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Excluir empresa</p>
                    <p className="text-xs text-text-muted">Apaga tudo, inclusive as contas de todos os colaboradores.</p>
                  </div>
                  <Button variant="destructive" onClick={() => setConfirmingDeleteCompany(true)} className="shrink-0">
                    <Trash2 size={16} />
                    Excluir
                  </Button>
                </div>
              )}

              {!isOnlyAdmin && (
                <div className="flex flex-col items-start gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Excluir minha conta</p>
                    <p className="text-xs text-text-muted">Ação permanente.</p>
                  </div>
                  <Button variant="destructive" onClick={() => setConfirmingDelete(true)} className="shrink-0">
                    <Trash2 size={16} />
                    Excluir
                  </Button>
                </div>
              )}
            </div>
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

      <ConfirmDialog
        open={confirmingLeaveCompany}
        onClose={() => setConfirmingLeaveCompany(false)}
        onConfirm={handleLeaveCompany}
        title="Sair da empresa"
        description="Você deixa de fazer parte desta empresa, mas seu login continua ativo. Você será desconectado."
        confirmLabel={leavingCompany ? 'Saindo...' : 'Sair da empresa'}
      />

      <Modal
        open={confirmingDeleteCompany}
        onClose={() => {
          setConfirmingDeleteCompany(false)
          setDeleteCompanyConfirmText('')
        }}
        title="Excluir empresa"
        description="Essa ação é permanente: apaga a empresa, todos os documentos, procedimentos e avisos, e a conta de login de todos os colaboradores, inclusive a sua."
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
