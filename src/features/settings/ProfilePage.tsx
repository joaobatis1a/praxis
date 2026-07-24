import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, User as UserIcon } from 'lucide-react'
import { Badge, Button, Card, Input, Select, useToast } from '../../components/ui'
import { getUserDepartment } from '../../lib/userDepartment'
import type { Role } from '../auth/types'
import { useAuth } from '../auth/AuthContext'
import { listDepartments } from '../departments/api'
import { updateProfile } from './api'

const roleLabels: Record<Role, string> = {
  admin: 'Proprietário',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
}

export function ProfilePage() {
  const { user, setSessionUser, noCompanySession, isMaintenanceAccount } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [department, setDepartment] = useState(() => getUserDepartment(user) ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [departmentsList, setDepartmentsList] = useState<string[]>([])

  useEffect(() => {
    setName(user?.name ?? '')
    setDepartment(getUserDepartment(user) ?? '')
  }, [user])

  useEffect(() => {
    if (user?.role !== 'admin') return
    listDepartments().then(setDepartmentsList)
  }, [user])

  async function handleSaveProfile() {
    if (!user) return
    setSavingProfile(true)
    try {
      const updated = await updateProfile(user.id, { name: name.trim(), email: user.email, role: user.role, department })
      setSessionUser({ ...user, name: updated.name, department: updated.department })
      toast('Perfil atualizado.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível atualizar o perfil.', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  if (!user && !noCompanySession) return null

  if (!user) {
    // a bare maintenance/support session — no profiles row exists, so there's nothing to edit,
    // just the account identity behind the login
    return (
      <div className="mx-auto max-w-[720px] p-6 lg:p-8">
        <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text-primary">
          Meu perfil
        </motion.h1>
        <p className="mt-1 text-sm text-text-muted">Seus dados pessoais de acesso.</p>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <Card>
            <div className="flex items-center gap-2">
              <UserIcon size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-text-primary">Dados pessoais</h2>
            </div>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nome" value={noCompanySession?.name ?? ''} disabled />
                <Input label="E-mail" value={noCompanySession?.email ?? ''} disabled hint="O e-mail não pode ser alterado." />
              </div>
              <Badge variant="primary">{isMaintenanceAccount ? 'Manutenção' : 'Suporte'}</Badge>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px] p-6 lg:p-8">
      <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text-primary">
        Meu perfil
      </motion.h1>
      <p className="mt-1 text-sm text-text-muted">Seus dados pessoais de acesso.</p>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
        <Card>
          <div className="flex items-center gap-2">
            <UserIcon size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-text-primary">Dados pessoais</h2>
          </div>
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="E-mail" value={user.email} disabled hint="O e-mail não pode ser alterado." />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">{roleLabels[user.role]}</Badge>
              {user.role !== 'admin' && <Badge variant="neutral">{department}</Badge>}
            </div>
            {user.role === 'admin' && (
              <div className="flex flex-col gap-1.5 sm:max-w-xs">
                <label className="text-sm font-medium text-text-primary">Departamento</label>
                <Select
                  value={department}
                  onChange={setDepartment}
                  options={departmentsList.map((dept) => ({ value: dept, label: dept }))}
                  className="w-full"
                  triggerClassName="w-full"
                  aria-label="Meu departamento"
                />
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={savingProfile || !name.trim()}>
                <Save size={16} />
                {savingProfile ? 'Salvando...' : 'Salvar perfil'}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
