import { GraduationCap, ShieldCheck, UsersRound } from 'lucide-react'
import { Card } from '../../../components/ui'
import type { Role } from '../../auth/types'

const roleInfo: Record<Role, { label: string; icon: typeof ShieldCheck }> = {
  admin: { label: 'Proprietários', icon: ShieldCheck },
  gestor: { label: 'Gestores', icon: UsersRound },
  colaborador: { label: 'Colaboradores', icon: GraduationCap },
}

const roleOrder: Role[] = ['admin', 'gestor', 'colaborador']

export function RoleBreakdownCard({ breakdown }: { breakdown: Record<Role, number> }) {
  const total = roleOrder.reduce((sum, role) => sum + breakdown[role], 0) || 1

  return (
    <Card className="min-w-0">
      <h3 className="text-base font-semibold text-text-primary">Colaboradores por cargo</h3>
      <div className="mt-4 space-y-3">
        {roleOrder.map((role) => {
          const info = roleInfo[role]
          const count = breakdown[role]
          const pct = Math.round((count / total) * 100)
          return (
            <div key={role}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-text-secondary">
                  <info.icon size={14} />
                  {info.label}
                </span>
                <span className="font-medium text-text-primary">{count}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
