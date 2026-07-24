import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navigate } from 'react-router-dom'
import { Button, Card, Skeleton, useToast } from '../../components/ui'
import { KeyRound, Trash2, Wrench } from 'lucide-react'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { useAuth } from '../auth/AuthContext'
import { InviteCodeModal } from '../users/components/InviteCodeModal'
import { generateMaintenanceInviteCode, listMaintenanceAccounts, removeMaintenanceAccount, type MaintenanceAccount } from './api'

export function MaintenanceTeamPage() {
  const { isMaintenanceAccount, maintenanceChecked } = useAuth()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<MaintenanceAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingAccountCode, setGeneratingAccountCode] = useState(false)
  const [generatedAccountCode, setGeneratedAccountCode] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isMaintenanceAccount) return
    listMaintenanceAccounts().then((data) => {
      setAccounts(data)
      setLoading(false)
    })
  }, [isMaintenanceAccount])

  // wait for the async maintenance check before deciding to bounce someone away — otherwise a
  // real maintenance account gets flashed to /dashboard on every hard refresh of this page
  if (!maintenanceChecked) return null
  if (!isMaintenanceAccount) return <Navigate to="/dashboard" replace />

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
        Time
      </motion.h1>
      <p className="mt-1 text-sm text-text-muted">Contas com acesso de manutenção — veem esta página e o suporte de todas as empresas.</p>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-6">
        <motion.div variants={staggerItem}>
          <Card>
            <div className="flex items-center gap-2">
              <Wrench size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-text-primary">Contas de manutenção</h2>
            </div>

            <div className="mt-4">
              <Button type="button" onClick={handleGenerateAccountCode} disabled={generatingAccountCode}>
                <KeyRound size={16} />
                {generatingAccountCode ? 'Gerando...' : 'Gerar código de convite'}
              </Button>
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
        code={generatedAccountCode}
        onClose={() => setGeneratedAccountCode(null)}
        title="Código de manutenção gerado"
        description="Uso único. Resgata em Entrar > Criar conta > É um código de manutenção?"
      />
    </div>
  )
}
