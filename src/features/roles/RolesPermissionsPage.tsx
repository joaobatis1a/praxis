import { useEffect, useState } from 'react'
import { GraduationCap, Lock, ShieldCheck, UsersRound } from 'lucide-react'
import { Card, Switch } from '../../components/ui'
import { cn } from '../../lib/cn'
import type { Role } from '../auth/types'
import { countByRole, getModules, getPermissions, setPermission } from './api'

const roleInfo: Record<Role, { label: string; description: string; icon: typeof ShieldCheck }> = {
  admin: { label: 'Administrador', description: 'Acesso total à plataforma.', icon: ShieldCheck },
  gestor: { label: 'Gestor', description: 'Gerencia equipe e conteúdo.', icon: UsersRound },
  colaborador: { label: 'Colaborador', description: 'Consulta e realiza treinamentos.', icon: GraduationCap },
}

const roleOrder: Role[] = ['admin', 'gestor', 'colaborador']

export function RolesPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<Role>('gestor')
  const [permissions, setPermissions] = useState<Record<Role, Record<string, boolean>> | null>(null)
  const modules = getModules()

  useEffect(() => {
    getPermissions().then(setPermissions)
  }, [])

  async function handleToggle(moduleKey: string, enabled: boolean) {
    const updated = await setPermission(selectedRole, moduleKey, enabled)
    setPermissions(updated)
  }

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-text-primary">Cargos e Permissões</h1>
      <p className="mt-1 text-sm text-text-muted">
        Defina o que cada cargo pode acessar dentro da plataforma.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {roleOrder.map((role) => {
          const info = roleInfo[role]
          const isSelected = role === selectedRole
          return (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={cn(
                'rounded-lg border p-5 text-left transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border bg-surface-card hover:border-border-strong',
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <info.icon size={20} />
              </div>
              <h3 className="mt-3 text-base font-semibold text-text-primary">{info.label}</h3>
              <p className="mt-1 text-sm text-text-muted">{info.description}</p>
              <p className="mt-3 text-xs font-medium text-text-muted">{countByRole(role)} colaboradores</p>
            </button>
          )
        })}
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Permissões — {roleInfo[selectedRole].label}
            </h3>
            <p className="text-sm text-text-muted">Ative ou desative o acesso por módulo.</p>
          </div>
          {selectedRole === 'admin' && (
            <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-muted">
              <Lock size={12} />
              Acesso total, não editável
            </span>
          )}
        </div>

        <div className="mt-5 divide-y divide-border">
          {modules.map((mod) => (
            <div key={mod.key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-text-primary">{mod.label}</p>
                <p className="text-xs text-text-muted">{mod.description}</p>
              </div>
              <Switch
                checked={permissions?.[selectedRole]?.[mod.key] ?? false}
                disabled={selectedRole === 'admin'}
                onChange={(e) => handleToggle(mod.key, e.target.checked)}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
