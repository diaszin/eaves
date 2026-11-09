import clsx from 'clsx'

interface AvatarProps {
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function getColorFromName(name?: string): string {
  const colors = [
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-blue-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-green-500',
    'bg-orange-500',
  ]
  if (!name) return colors[0]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full font-semibold text-white select-none',
        SIZE_CLASSES[size],
        getColorFromName(name),
        className,
      )}
    >
      {getInitials(name)}
    </div>
  )
}
