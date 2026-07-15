import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../lib/theme-provider'

interface ThemeToggleProps {
  /** fires with the theme just switched to — lets callers persist it somewhere beyond localStorage */
  onAfterToggle?: (theme: 'light' | 'dark') => void
}

export function ThemeToggle({ onAfterToggle }: ThemeToggleProps = {}) {
  const { theme, toggleTheme } = useTheme()

  function handleClick() {
    toggleTheme()
    onAfterToggle?.(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.85, rotate: -20 }}
      aria-label="Alternar tema"
      className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="absolute"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
