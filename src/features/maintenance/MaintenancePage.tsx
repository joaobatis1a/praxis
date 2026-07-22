import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import { Badge, Button, Card, Input, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, useToast } from '../../components/ui'
import { Building2, Plus, Trash2, UserPlus, Wrench } from 'lucide-react'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { useAuth } from '../auth/AuthContext'
import { InviteCodeModal } from '../users/components/InviteCodeModal'
import {
  addMaintenanceAccount,
  createCompanyForClient,
  listCompanies,
  listMaintenanceAccounts,
  removeMaintenanceAccount,
  type MaintenanceAccount,
  type MaintenanceCompany,
} from './api'

export function MaintenancePage() {
  const { isMaintenanceAccount, maintenanceChecked } = useAuth()
  const { toast } = useToast()
  const [companies, setCompanies] = useState<MaintenanceCompany[]>([])
  const [accounts, setAccounts] = useState<MaintenanceAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [newCompanyName, setNewCompanyName] = useState('')
  const [creatingCompany, setCreatingCompany] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

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
      setGeneratedCode(code)
      setNewCompanyName('')
      const updated = await listCompanies()
      setCompanies(updated)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível criar a empresa.', 'error')
    } finally {
      setCreatingCompany(false)
    }
  }

  async function handleAddAccount(e: FormEvent) {
    e.preventDefault()
    const email = newEmail.trim().toLowerCase()
    if (!email) return
    setAdding(true)
    try {
      await addMaintenanceAccount(email)
      const updated = await listMaintenanceAccounts()
      setAccounts(updated)
      setNewEmail('')
      toast(`${email} agora tem acesso de manutenção.`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível adicionar essa conta.', 'error')
    } finally {
      setAdding(false)
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
            <p className="mt-1 text-sm text-text-muted">Somente leitura — não é possível editar dados de outra empresa por aqui.</p>

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
                      <TableHeaderCell>Administrador</TableHeaderCell>
                      <TableHeaderCell>Usuários</TableHeaderCell>
                      <TableHeaderCell>Criada em</TableHeaderCell>
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
                          {company.adminName ? (
                            <div>
                              <p className="text-text-primary">{company.adminName}</p>
                              <p className="text-xs text-text-muted">{company.adminEmail}</p>
                            </div>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>{company.memberCount}</TableCell>
                        <TableCell>{new Date(company.createdAt).toLocaleDateString('pt-BR')}</TableCell>
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

            <form onSubmit={handleAddAccount} className="mt-4 flex gap-2">
              <Input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="flex-1"
              />
              <Button type="submit" disabled={adding || !newEmail.trim()}>
                <UserPlus size={16} />
                {adding ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </form>

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

      <InviteCodeModal code={generatedCode} onClose={() => setGeneratedCode(null)} />
    </div>
  )
}
