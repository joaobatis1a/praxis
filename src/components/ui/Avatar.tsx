import { cn } from '../../lib/cn'

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: number
  className?: string
}

export function Avatar({ name, avatarUrl, size = 36, className }: AvatarProps) {
  const style = { width: size, height: size, fontSize: Math.max(11, size * 0.4) }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={style}
        className={cn('shrink-0 rounded-full object-cover', className)}
      />
    )
  }

  return (
    <div
      style={style}
      className={cn('flex shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary', className)}
    >
      {initialsOf(name)}
    </div>
  )
}
