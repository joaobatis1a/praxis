import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../lib/theme-provider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Alternar tema"
      className="rounded-md p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  )
}
