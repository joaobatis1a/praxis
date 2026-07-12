import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, Menu } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface HeaderProps {
  onSearch?: (value: string) => void
  notificationCount?: number
  onNotificationsClick?: () => void
  onMenuClick?: () => void
  rightSlot?: ReactNode
  avatar?: ReactNode
}

export function Header({
  onSearch,
  notificationCount = 0,
  onNotificationsClick,
  onMenuClick,
  rightSlot,
  avatar,
}: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-surface-card px-4 sm:gap-4 sm:px-6">
      {onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="shrink-0 rounded-md p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary md:hidden"
        >
          <Menu size={20} />
        </button>
      )}

      <div className="group relative w-full min-w-0 max-w-md">
        <motion.span
          initial={false}
          whileHover={{ scale: 1.15 }}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors duration-200 group-focus-within:text-primary"
        >
          <Search size={18} strokeWidth={2} />
        </motion.span>
        <input
          type="text"
          placeholder="Buscar..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 hover:border-border-strong hover:shadow-[var(--shadow-level-1)] focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 sm:pr-16"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-sm border border-border bg-surface-card px-1.5 py-0.5 text-xs text-text-muted transition-opacity duration-200 group-hover:opacity-70 sm:block">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
        {rightSlot}

        <motion.button
          type="button"
          onClick={onNotificationsClick}
          whileHover={{ rotate: [0, -14, 11, -8, 5, 0] }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.5 }}
          aria-label="Notificações"
          className="relative rounded-md p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span
              className={cn(
                'absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-primary',
                'ring-2 ring-surface-card',
              )}
            />
          )}
        </motion.button>

        {avatar}
      </div>
    </header>
  )
}
