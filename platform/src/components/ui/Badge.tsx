import clsx from 'clsx'
import type { PlatformRole } from '@/lib/auth'

type BadgeRole = PlatformRole | 'patient'
type BadgeVariant = BadgeRole | 'success' | 'warning' | 'error' | 'info' | 'default'

const ROLE_LABELS: Record<BadgeRole, string> = {
  coordinator: 'Coordenador',
  professor: 'Professor',
  lobby: 'Recepcionista',
  trainee: 'Estagiário',
  patient: 'Paciente',
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  coordinator: 'bg-purple-100 text-purple-700 border border-purple-200',
  professor: 'bg-blue-100 text-blue-700 border border-blue-200',
  lobby: 'bg-green-100 text-green-700 border border-green-200',
  trainee: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  patient: 'bg-slate-100 text-slate-600 border border-slate-200',
  success: 'bg-green-100 text-green-700 border border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  error: 'bg-red-100 text-red-700 border border-red-200',
  info: 'bg-blue-100 text-blue-700 border border-blue-200',
  default: 'bg-slate-100 text-slate-600 border border-slate-200',
}

interface BadgeProps {
  variant?: BadgeVariant
  role?: BadgeRole
  children?: React.ReactNode
  className?: string
}

export function Badge({ variant, role, children, className }: BadgeProps) {
  const v: BadgeVariant = role ?? variant ?? 'default'
  const label = children ?? (role ? ROLE_LABELS[role] : undefined)

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        VARIANT_CLASSES[v],
        className,
      )}
    >
      {label}
    </span>
  )
}

export { ROLE_LABELS }
