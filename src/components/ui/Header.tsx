import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Bell, Menu } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface HeaderProps {
  notificationCount?: number
  onNotificationsClick?: () => void
  onMenuClick?: () => void
  rightSlot?: ReactNode
  avatar?: ReactNode
}

export function Header({
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
