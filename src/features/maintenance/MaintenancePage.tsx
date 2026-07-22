import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  Input,
  Modal,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  useToast,
} from '../../components/ui'
import { Building2, KeyRound, Plus, Power, PowerOff, Trash2, Wrench } from 'lucide-react'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { useAuth } from '../auth/AuthContext'
import { InviteCodeModal } from '../users/components/InviteCodeModal'
import {
  createCompanyForClient,
  deleteCompanyAsMaintenance,
  generateMaintenanceInviteCode,
  listCompanies,
  listMaintenanceAccounts,
  removeMaintenanceAccount,
  setCompanyStatus,
  type MaintenanceAccount,
  type MaintenanceCompany,
} from './api'

export function MaintenancePage() {
  const { isMaintenanceAccount, maintenanceChecked } = useAuth()
  const { toast } = useToast()
  const [companies, setCompanies] = useState<MaintenanceCompany[]>([])
  const [accounts, setAccounts] = useState<MaintenanceAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingAccountCode, setGeneratingAccountCode] = useState(false)
  const [generatedAccountCode, setGeneratedAccountCode] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [newCompanyName, setNewCompanyName] = useState('')
  const [creatingCompany, setCreatingCompany] = useState(false)
  const [generatedCompanyCode, setGeneratedCompanyCode] = useState<string | null>(null)
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null)
  const [deletingCompany, setDeletingCompany] = useState<MaintenanceCompany | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingInFlight, setDeletingInFlight] = useState(false)

  useEffect(() => {
    if (!isMaintenanceAccount) return
    Promise.all([listCompanies(), listMaintenanceAccounts()]).then(([companyData, accountData]) => {
      setCompanies(companyData)
      setAccounts(accountData)
      setLoading(false)
    })
  }, [isMaintenanceAccount])

  // wait for the async maintenance check before deciding to bounce someone away — otherwise a
  // real maintenance account gets flashed to /dashboard on every hard refresh of this page
  if (!maintenanceChecked) return null
  if (!isMaintenanceAccount) return <Navigate to="/dashboard" replace />

  async function handleCreateCompany(e: FormEvent) {
    e.preventDefault()
    const name = newCompanyName.trim()
    if (!name) return
    setCreatingCompany(true)
    try {
      const code = await createCompanyForClient(name)
      setGeneratedCompanyCode(code)
      setNewCompanyName('')
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

  async function handleGenerateAccountCode() {
    setGeneratingAccountCode(true)
    try {
      const code = await generateMaintenanceInviteCode()
      setGeneratedAccountCode(code)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível gerar o código.', 'error')
    } finally {
      setGeneratingAccountCode(false)
    }
  }

  async function handleRemoveAccount(account: MaintenanceAccount) {
    setRemovingId(account.id)
    try {
      await removeMaintenanceAccount(account.email)
      setAccounts((prev) => prev.filter((a) => a.id !== account.id))
      toast(`${account.email} foi removido da manutenção.`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível remover essa conta.', 'error')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text-primary">
        Manutenção
      </motion.h1>
      <p className="mt-1 text-sm text-text-muted">Visão geral das empresas cadastradas e das contas com acesso de manutenção.</p>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-6 space-y-6">
        <motion.div variants={staggerItem}>
          <Card>
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-text-primary">Nova empresa</h2>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Cria a empresa e gera um código de admin — envie esse código para o responsável do cliente, ele usa em Criar conta &gt; Tenho um código.
            </p>

            <form onSubmit={handleCreateCompany} className="mt-4 flex gap-2">
              <Input
                required
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Nome da empresa"
                className="flex-1"
              />
              <Button type="submit" disabled={creatingCompany || !newCompanyName.trim()}>
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
            <p className="mt-1 text-sm text-text-muted">Dados são só leitura — as ações abaixo afetam só o status/existência da empresa.</p>

            <div className="mt-4">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : companies.length === 0 ? (
                <p className="py-6 text-center text-sm text-text-muted">Nenhuma empresa cadastrada.</p>
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
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium text-text-primary">{company.name}</TableCell>
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

        <motion.div variants={staggerItem}>
          <Card>
            <div className="flex items-center gap-2">
              <Wrench size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-text-primary">Contas de manutenção</h2>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Quem está nessa lista vê esta página e a caixa de suporte de todas as empresas, além da própria conta normal (se tiver uma).
            </p>

            <div className="mt-4">
              <Button type="button" onClick={handleGenerateAccountCode} disabled={generatingAccountCode}>
                <KeyRound size={16} />
                {generatingAccountCode ? 'Gerando...' : 'Gerar código de convite'}
              </Button>
              <p className="mt-1.5 text-xs text-text-muted">
                Código de uso único — a pessoa resgata em Configurações &gt; Tenho um código de manutenção (se já tiver conta) ou no cadastro
                (se não tiver).
              </p>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{account.email}</p>
                        <p className="text-xs text-text-muted">
                          Adicionado em {new Date(account.createdAt).toLocaleDateString('pt-BR')}
                          {account.addedBy ? ` por ${account.addedBy}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAccount(account)}
                        disabled={removingId === account.id || accounts.length === 1}
                        aria-label="Remover conta de manutenção"
                        title={accounts.length === 1 ? 'Não é possível remover a última conta de manutenção' : undefined}
                        className="shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:bg-error-bg hover:text-error disabled:pointer-events-none disabled:opacity-30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <InviteCodeModal
        code={generatedCompanyCode}
        onClose={() => setGeneratedCompanyCode(null)}
        title="Convite de empresa gerado"
        description="Envie esse código para o responsável do cliente — ele usa em Criar conta > Tenho um código."
      />

      <InviteCodeModal
        code={generatedAccountCode}
        onClose={() => setGeneratedAccountCode(null)}
        title="Código de manutenção gerado"
        description="Código de uso único. A pessoa resgata em Configurações > Tenho um código de manutenção (se já tiver conta) ou no cadastro (se não tiver)."
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
