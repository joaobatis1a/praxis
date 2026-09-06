import { Check, X } from 'lucide-react'
import { cn } from '../../../lib/cn'

export const passwordRequirements = [
  { id: 'tamanho', label: 'Mínimo de 8 caracteres', test: (s: string) => s.length >= 8 },
  { id: 'maiuscula', label: 'Uma letra maiúscula', test: (s: string) => /[A-Z]/.test(s) },
  { id: 'numero', label: 'Um número', test: (s: string) => /[0-9]/.test(s) },
  { id: 'especial', label: 'Um caractere especial (!@#$%...)', test: (s: string) => /[^A-Za-z0-9]/.test(s) },
]

export function isPasswordValid(password: string) {
  return passwordRequirements.every((r) => r.test(password))
}

/** Live checklist shown under a new-password field — only appears once the user starts typing,
 * so an untouched field doesn't open with a wall of red X's. */
export function PasswordRequirements({ password }: { password: string }) {
  if (!password) return null

  return (
    <ul className="flex flex-col gap-1">
      {passwordRequirements.map((req) => {
        const ok = req.test(password)
        return (
          <li key={req.id} className={cn('flex items-center gap-1.5 text-xs transition-colors', ok ? 'text-success' : 'text-text-muted')}>
            {ok ? <Check size={13} /> : <X size={13} />}
            {req.label}
          </li>
        )
      })}
    </ul>
  )
}
