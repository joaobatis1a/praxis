import logoSrc from '../../assets/logo-praxis.png'
import { cn } from '../../lib/cn'

export interface LogoProps {
  size?: number
  showText?: boolean
  textClassName?: string
  className?: string
}

export function Logo({ size = 28, showText = true, textClassName, className }: LogoProps) {
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-2', className)}>
      <img src={logoSrc} alt="Praxis" width={size} height={size} className="rounded-md" />
      {showText && <span className={cn('font-brand text-lg font-bold', textClassName)}>Praxis</span>}
    </span>
  )
}
