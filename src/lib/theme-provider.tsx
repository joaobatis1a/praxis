import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'praxis-theme'

/**
 * One frame of the wipe: a wavy boundary line, `level` 0 (nothing revealed) to 1 (fully revealed).
 * `anchorTop`: the revealed region grows down from the top edge (curtain falling) instead of up from the bottom (water rising).
 */
function buildWavePath(level: number, phase: number, anchorTop: boolean): string {
  const width = window.innerWidth
  const height = window.innerHeight
  const amplitude = 14
  const wavelength = Math.max(220, width / 2.5)
  const steps = 32
  const baseY = anchorTop ? height * level : height * (1 - level)

  const wavePoints: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const x = (width * i) / steps
    const y = Math.min(height, Math.max(0, baseY + Math.sin((x / wavelength) * Math.PI * 2 + phase) * amplitude))
    wavePoints.push([x, y])
  }

  const points = anchorTop
    ? [[0, 0], [width, 0], ...[...wavePoints].reverse()]
    : [...wavePoints, [width, height], [0, height]]

  return `polygon(${points.map(([x, y]) => `${x}px ${y}px`).join(', ')})`
}

/** A sequence of wave clip-paths that both grows AND undulates sideways as it moves, like moving water. */
function buildWaveKeyframes(anchorTop: boolean): string[] {
  const frames = 26
  const keyframes: string[] = []
  for (let i = 0; i <= frames; i++) {
    const t = i / frames
    const phase = t * Math.PI * 6
    keyframes.push(buildWavePath(t, phase, anchorTop))
  }
  return keyframes
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = (next: Theme) => setThemeState(next)

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!document.startViewTransition || prefersReducedMotion) {
      setThemeState(next)
      return
    }

    const transition = document.startViewTransition(() => {
      setThemeState(next)
    })

    // light -> dark: dark falls like a curtain, top to bottom.
    // dark -> light: light rises like water filling a glass, bottom to top.
    // Always animates the incoming view on top of the still-visible outgoing one, so nothing ever goes blank.
    const anchorTop = next === 'dark'

    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: buildWaveKeyframes(anchorTop) },
        {
          duration: 850,
          easing: 'cubic-bezier(0.5, 0, 0.4, 1)',
          pseudoElement: '::view-transition-new(root)',
          fill: 'forwards',
        },
      )
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
