import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GraduationCap, Lock, ShieldCheck, UsersRound } from 'lucide-react'
import { Card, Switch, useToast } from '../../components/ui'
import { cn } from '../../lib/cn'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import type { Role } from '../auth/types'
import { countByRole, getModules, getPermissions, setPermission } from './api'

const roleInfo: Record<Role, { label: string; description: string; icon: typeof ShieldCheck }> = {
  admin: { label: 'Proprietário', description: 'Acesso total à plataforma.', icon: ShieldCheck },
  gestor: { label: 'Gestor', description: 'Gerencia equipe e conteúdo.', icon: UsersRound },
  colaborador: { label: 'Colaborador', description: 'Consulta e realiza treinamentos.', icon: GraduationCap },
}

const roleOrder: Role[] = ['admin', 'gestor', 'colaborador']

export function RolesPermissionsPage() {
  const { toast } = useToast()
  const [selectedRole, setSelectedRole] = useState<Role>('gestor')
  const [permissions, setPermissions] = useState<Record<Role, Record<string, boolean>> | null>(null)
  const [counts, setCounts] = useState<Record<Role, number> | null>(null)
  const modules = getModules()

  useEffect(() => {
    getPermissions().then(setPermissions)
    Promise.all(roleOrder.map((role) => countByRole(role))).then((values) =>
      setCounts(Object.fromEntries(roleOrder.map((role, i) => [role, values[i]])) as Record<Role, number>),
    )
  }, [])

  async function handleToggle(moduleKey: string, enabled: boolean) {
    const updated = await setPermission(selectedRole, moduleKey, enabled)
    setPermissions(updated)
    const mod = modules.find((m) => m.key === moduleKey)
    toast(
      `${mod?.label ?? 'Módulo'} ${enabled ? 'liberado' : 'bloqueado'} para ${roleInfo[selectedRole].label}.`,
      enabled ? 'success' : 'info',
    )
  }

  return (
    <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-text-primary"
      >
        Cargos e Permissões
      </motion.h1>
      <p className="mt-1 text-sm text-text-muted">
        Defina o que cada cargo pode acessar dentro da plataforma.
      </p>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-6 grid gap-4 sm:grid-cols-3">
        {roleOrder.map((role) => {
          const info = roleInfo[role]
          const isSelected = role === selectedRole
          return (
            <motion.button
              key={role}
              variants={staggerItem}
              type="button"
              onClick={() => setSelectedRole(role)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className={cn(
                'relative overflow-hidden rounded-lg border p-5 text-left',
                isSelected ? 'border-primary ring-1 ring-primary' : 'border-border bg-surface-card hover:border-border-strong',
              )}
            >
              {isSelected && (
                <motion.div
                  layoutId="role-highlight"
                  transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                  className="absolute inset-0 bg-primary/5"
                />
              )}
              <div className="relative">
                <motion.div
                  animate={isSelected ? { scale: 1.1, rotate: -6 } : { scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"
                >
                  <info.icon size={20} />
                </motion.div>
                <h3 className="mt-3 text-base font-semibold text-text-primary">{info.label}</h3>
                <p className="mt-1 text-sm text-text-muted">{info.description}</p>
                <p className="mt-3 text-xs font-medium text-text-muted">
                  {counts?.[role] ?? '–'} {counts?.[role] === 1 ? 'usuário' : 'usuários'}
                </p>
              </div>
            </motion.button>
          )
        })}
      </motion.div>

      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Permissões: {roleInfo[selectedRole].label}
            </h3>
            <p className="text-sm text-text-muted">Ative ou desative o acesso por módulo.</p>
          </div>
          <AnimatePresence>
            {selectedRole === 'admin' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium text-text-muted"
              >
                <Lock size={12} />
                Acesso total, não editável
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRole}
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="mt-5 divide-y divide-border"
          >
            {modules.map((mod) => (
              <motion.div
                key={mod.key}
                variants={staggerItem}
                className="flex items-center justify-between rounded-md py-3.5 pl-2 transition-colors first:pt-0 last:pb-0 hover:bg-surface-hover"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{mod.label}</p>
                  <p className="text-xs text-text-muted">{mod.description}</p>
                </div>
                <Switch
                  checked={permissions?.[selectedRole]?.[mod.key] ?? false}
                  disabled={selectedRole === 'admin'}
                  onChange={(e) => handleToggle(mod.key, e.target.checked)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  )
}
