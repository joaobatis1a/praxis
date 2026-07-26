import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  ImageCropModal,
  Input,
  Modal,
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
import { Building2, Camera, KeyRound, Plus, Power, PowerOff, Search, Trash2, X } from 'lucide-react'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { useAuth } from '../auth/AuthContext'
import { uploadCompanyLogo } from '../settings/api'
import { InviteCodeModal } from '../users/components/InviteCodeModal'
import {
  createCompanyForClient,
  deleteCompanyAsMaintenance,
  getCompanyInviteCode,
  listCompanies,
  setCompanyStatus,
  type MaintenanceCompany,
} from './api'

function CompanyLogoThumb({ logoUrl, name }: { logoUrl: string | null; name: string }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface">
      {logoUrl ? (
        <img src={logoUrl} alt={name} className="h-full w-full object-contain" />
      ) : (
        <Building2 size={16} className="text-text-muted" />
      )}
    </div>
  )
}

const statusOptions = [
  { value: 'todas', label: 'Todos os status' },
  { value: 'ativo', label: 'Ativas' },
  { value: 'inativo', label: 'Inativas' },
]

const sortOptions = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigas' },
  { value: 'name', label: 'Nome (A-Z)' },
]

export function MaintenancePage() {
  const { isMaintenanceAccount, maintenanceChecked } = useAuth()
  const { toast } = useToast()
  const [companies, setCompanies] = useState<MaintenanceCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todas')
  const [sortBy, setSortBy] = useState('recent')
  const [newCompanyName, setNewCompanyName] = useState('')
  const [newCompanyLogo, setNewCompanyLogo] = useState<File | null>(null)
  const [newCompanyLogoPreview, setNewCompanyLogoPreview] = useState<string | null>(null)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [creatingCompany, setCreatingCompany] = useState(false)
  const [generatedCompanyCode, setGeneratedCompanyCode] = useState<string | null>(null)
  const [loadingCodeId, setLoadingCodeId] = useState<string | null>(null)
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null)
  const [deletingCompany, setDeletingCompany] = useState<MaintenanceCompany | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingInFlight, setDeletingInFlight] = useState(false)

  useEffect(() => {
    if (!isMaintenanceAccount) return
    listCompanies().then((data) => {
      setCompanies(data)
      setLoading(false)
    })
  }, [isMaintenanceAccount])

  const filteredCompanies = useMemo(() => {
    return companies
      .filter((c) => statusFilter === 'todas' || c.status === statusFilter)
      .filter((c) => !search.trim() || c.name.toLowerCase().includes(search.trim().toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'oldest') return a.createdAt.localeCompare(b.createdAt)
        return b.createdAt.localeCompare(a.createdAt)
      })
  }, [companies, search, statusFilter, sortBy])

  // wait for the async maintenance check before deciding to bounce someone away — otherwise a
  // real maintenance account gets flashed to /dashboard on every hard refresh of this page
  if (!maintenanceChecked) return null
  if (!isMaintenanceAccount) return <Navigate to="/dashboard" replace />

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setCropFile(file)
  }

  function handleLogoCropConfirm(file: File) {
    setCropFile(null)
    setNewCompanyLogo(file)
    setNewCompanyLogoPreview(URL.createObjectURL(file))
  }

  function clearNewCompanyLogo() {
    setNewCompanyLogo(null)
    setNewCompanyLogoPreview(null)
  }

  async function handleCreateCompany(e: FormEvent) {
    e.preventDefault()
    const name = newCompanyName.trim()
    if (!name) return
    setCreatingCompany(true)
    try {
      const { code, companyId } = await createCompanyForClient({ name })
      if (newCompanyLogo) {
        try {
          await uploadCompanyLogo(companyId, newCompanyLogo)
        } catch {
          toast('Empresa criada, mas não foi possível enviar a foto.', 'error')
        }
      }
      setGeneratedCompanyCode(code)
      setNewCompanyName('')
      clearNewCompanyLogo()
      const updated = await listCompanies()
      setCompanies(updated)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível criar a empresa.', 'error')
    } finally {
      setCreatingCompany(false)
    }
  }

  async function handleToggleStatus(company: MaintenanceCompany) {
    const nextStatus = company.status === 'ativo' ? 'inativo' : 'ativo'
    setTogglingStatusId(company.id)
    try {
      await setCompanyStatus(company.id, nextStatus)
      setCompanies((prev) => prev.map((c) => (c.id === company.id ? { ...c, status: nextStatus } : c)))
      toast(nextStatus === 'inativo' ? `${company.name} foi desativada.` : `${company.name} foi reativada.`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível atualizar o status.', 'error')
    } finally {
      setTogglingStatusId(null)
    }
  }

  async function handleViewInviteCode(company: MaintenanceCompany) {
    setLoadingCodeId(company.id)
    try {
      const code = await getCompanyInviteCode(company.id)
      if (!code) {
        toast('Nenhum código de convite encontrado para esta empresa.', 'error')
        return
      }
      setGeneratedCompanyCode(code)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível recuperar o código.', 'error')
    } finally {
      setLoadingCodeId(null)
    }
  }

  async function handleDeleteCompany() {
    if (!deletingCompany) return
    setDeletingInFlight(true)
    try {
      await deleteCompanyAsMaintenance(deletingCompany.id)
      setCompanies((prev) => prev.filter((c) => c.id !== deletingCompany.id))
      toast(`${deletingCompany.name} foi excluída.`, 'error')
      setDeletingCompany(null)
      setDeleteConfirmText('')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível excluir a empresa.', 'error')
    } finally {
      setDeletingInFlight(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text-primary">
        Manutenção
      </motion.h1>
      <p className="mt-1 text-sm text-text-muted">Visão geral das empresas cadastradas.</p>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-6 space-y-6">
        <motion.div variants={staggerItem}>
          <Card>
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-text-primary">Nova empresa</h2>
            </div>
            <p className="mt-1 text-sm text-text-muted">Gera um código de admin para o responsável do cliente.</p>

            <form onSubmit={handleCreateCompany} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  aria-label="Adicionar foto da empresa"
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-dashed border-border-strong bg-surface text-text-muted transition-colors hover:border-primary hover:text-primary"
                >
                  {newCompanyLogoPreview ? (
                    <img src={newCompanyLogoPreview} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
                {newCompanyLogoPreview && (
                  <button
                    type="button"
                    onClick={clearNewCompanyLogo}
                    aria-label="Remover foto selecionada"
                    className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-error text-white"
                  >
                    <X size={10} />
                  </button>
                )}
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </div>
              <Input
                required
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Nome da empresa"
                className="flex-1"
              />
              <Button type="submit" disabled={creatingCompany || !newCompanyName.trim()} className="self-start">
                <Plus size={16} />
                {creatingCompany ? 'Criando...' : 'Criar empresa'}
              </Button>
            </form>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card>
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-text-primary">Empresas cadastradas</h2>
            </div>
            <p className="mt-1 text-sm text-text-muted">Somente leitura, exceto pelas ações da coluna Ações.</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome da empresa..."
                  className="h-10 w-full rounded-md border border-border bg-surface-card pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
                />
              </div>
              <Select value={statusFilter} onChange={setStatusFilter} options={statusOptions} aria-label="Filtrar por status" />
              <Select value={sortBy} onChange={setSortBy} options={sortOptions} aria-label="Ordenar" />
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : filteredCompanies.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-muted">Nenhuma empresa encontrada.</p>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Empresa</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Administradores</TableHeaderCell>
                      <TableHeaderCell>Usuários</TableHeaderCell>
                      <TableHeaderCell>Criada em</TableHeaderCell>
                      <TableHeaderCell>Ações</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium text-text-primary">
                          <div className="flex items-center gap-2.5">
                            <CompanyLogoThumb logoUrl={company.logoUrl} name={company.name} />
                            <div>
                              <span title={company.notes ?? undefined}>{company.name}</span>
                              <span className="ml-1.5 font-normal text-text-muted">#{company.companyNumber}</span>
                              {(company.contactName || company.contactPhone) && (
                                <p className="mt-0.5 text-xs font-normal text-text-muted">
                                  {[company.contactName, company.contactPhone].filter(Boolean).join(' · ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={company.status === 'ativo' ? 'success' : 'neutral'}>
                            {company.status === 'ativo' ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <AdminList names={company.adminNames} emails={company.adminEmails} />
                        </TableCell>
                        <TableCell>{company.memberCount}</TableCell>
                        <TableCell>{new Date(company.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleViewInviteCode(company)}
                              disabled={loadingCodeId === company.id}
                              aria-label="Ver código de convite"
                              title="Ver código de convite"
                              className="shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-30"
                            >
                              <KeyRound size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(company)}
                              disabled={togglingStatusId === company.id}
                              aria-label={company.status === 'ativo' ? 'Desativar empresa' : 'Reativar empresa'}
                              title={company.status === 'ativo' ? 'Desativar empresa' : 'Reativar empresa'}
                              className="shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:bg-warning-bg hover:text-warning-foreground disabled:pointer-events-none disabled:opacity-30"
                            >
                              {company.status === 'ativo' ? <PowerOff size={16} /> : <Power size={16} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingCompany(company)}
                              aria-label="Excluir empresa"
                              title="Excluir empresa"
                              className="shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:bg-error-bg hover:text-error"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <InviteCodeModal
        code={generatedCompanyCode}
        onClose={() => setGeneratedCompanyCode(null)}
        title="Convite de empresa gerado"
        description="Envie esse código para o responsável do cliente. Ele usa em Criar conta > Tenho um código."
      />

      <ImageCropModal
        file={cropFile}
        open={!!cropFile}
        onCancel={() => setCropFile(null)}
        onConfirm={handleLogoCropConfirm}
        shape="square"
        title="Ajustar foto da empresa"
      />

      <Modal
        open={!!deletingCompany}
        onClose={() => {
          setDeletingCompany(null)
          setDeleteConfirmText('')
        }}
        title="Excluir empresa"
        description="Essa ação é permanente: apaga a empresa, todos os dados e o login de todos os colaboradores dela."
        className="max-w-sm"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">
              Digite <span className="font-semibold">{deletingCompany?.name}</span> para confirmar
            </label>
            <Input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDeletingCompany(null)
                setDeleteConfirmText('')
              }}
              disabled={deletingInFlight}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteCompany}
              disabled={deletingInFlight || deleteConfirmText.trim() !== deletingCompany?.name.trim()}
            >
              {deletingInFlight ? 'Excluindo...' : 'Excluir empresa'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function AdminList({ names, emails }: { names: string[]; emails: string[] }) {
  const [expanded, setExpanded] = useState(false)

  if (names.length === 0) return <>—</>

  const visibleCount = expanded ? names.length : 1
  const hiddenCount = names.length - visibleCount

  return (
    <div className="space-y-1">
      {names.slice(0, visibleCount).map((name, i) => (
        <div key={i}>
          <p className="text-text-primary">{name}</p>
          <p className="text-xs text-text-muted">{emails[i]}</p>
        </div>
      ))}
      {hiddenCount > 0 && (
        <button type="button" onClick={() => setExpanded(true)} className="text-xs font-medium text-primary hover:underline">
          Ver mais (+{hiddenCount})
        </button>
      )}
      {expanded && names.length > 1 && (
        <button type="button" onClick={() => setExpanded(false)} className="text-xs font-medium text-primary hover:underline">
          Ver menos
        </button>
      )}
    </div>
  )
}
