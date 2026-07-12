import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

const MotionNavLink = motion(NavLink)

export interface SidebarItem {
  to: string
  label: string
  icon: ReactNode
}

export interface SidebarSection {
  title?: string
  items: SidebarItem[]
}

export interface SidebarProps {
  sections: SidebarSection[]
  header?: ReactNode
  footer?: ReactNode
  /** Controls the off-canvas drawer below the `md` breakpoint. Ignored at `md` and up, where the sidebar is always visible. */
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ sections, header, footer, open = false, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          aria-hidden
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-dvh w-sidebar shrink-0 -translate-x-full flex-col border-r border-border bg-surface transition-transform duration-200 ease-out',
          'md:static md:z-auto md:translate-x-0',
          open && 'translate-x-0',
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {header}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-text-primary md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section, i) => (
            <div key={section.title ?? i} className={cn(i > 0 && 'mt-6')}>
              {section.title && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {section.title}
                </p>
              )}
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <MotionNavLink
                      to={item.to}
                      end
                      onClick={onClose}
                      whileHover="hover"
                      whileTap={{ scale: 0.97 }}
                      className={({ isActive }) =>
                        cn(
                          'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors',
                          'hover:text-text-primary',
                          isActive && 'text-primary hover:text-primary',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive ? (
                            <motion.span
                              layoutId="sidebar-active-bg"
                              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                              className="absolute inset-0 z-0 rounded-md bg-primary/10"
                            />
                          ) : (
                            <motion.span
                              variants={{ hover: { opacity: 1 }, initial: { opacity: 0 } }}
                              initial="initial"
                              animate="initial"
                              className="absolute inset-0 z-0 rounded-md bg-surface-hover"
                            />
                          )}
                          {isActive && (
                            <motion.span
                              layoutId="sidebar-active-indicator"
                              transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                              className="absolute left-0 top-1/2 z-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary"
                            />
                          )}
                          <motion.span
                            variants={{ hover: { scale: 1.15, rotate: -6 }, initial: { scale: 1, rotate: 0 } }}
                            initial="initial"
                            animate="initial"
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                            className="relative z-10 shrink-0"
                          >
                            {item.icon}
                          </motion.span>
                          <motion.span
                            variants={{ hover: { x: 2 }, initial: { x: 0 } }}
                            initial="initial"
                            animate="initial"
                            className="relative z-10"
                          >
                            {item.label}
                          </motion.span>
                        </>
                      )}
                    </MotionNavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {footer && <div className="border-t border-border p-3">{footer}</div>}
      </aside>
    </>
  )
}
