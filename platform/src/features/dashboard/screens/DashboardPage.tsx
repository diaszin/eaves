import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Users, ClipboardList, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/contexts/auth'
import { appointmentsService } from '@/features/appointments/services/appointments.service'
import { usersService } from '@/features/users/services/users.service'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'
import clsx from 'clsx'

function formatTime(dateStr?: string) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  } catch {
    return dateStr
  }
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Ausente',
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
  no_show: 'bg-orange-100 text-orange-700',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const appointmentsQ = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentsService.list(),
  })

  const usersQ = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.list(),
    enabled: user?.role === 'coordinator' || user?.role === 'lobby',
  })

  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = (appointmentsQ.data ?? []).filter(
    (a) => (a.initialDate ?? a.date)?.startsWith(today),
  )
  const upcomingAppointments = (appointmentsQ.data ?? [])
    .filter(
      (a) =>
        (a.status ?? 'scheduled') === 'scheduled' ||
        a.status === 'confirmed',
    )
    .slice(0, 5)

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const firstName = user?.profile?.fullname?.split(' ')[0] ?? 'usuário'

  return (
    <div className="p-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="mt-1 text-slate-500">
          Aqui está um resumo do que está acontecendo hoje.
        </p>
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Agendamentos hoje"
          value={appointmentsQ.isLoading ? '...' : String(todayAppointments.length)}
          icon={<CalendarDays className="h-6 w-6" />}
          color="indigo"
          onClick={() => navigate('/appointments')}
        />
        <StatCard
          title="Total de agendamentos"
          value={appointmentsQ.isLoading ? '...' : String(appointmentsQ.data?.length ?? 0)}
          icon={<TrendingUp className="h-6 w-6" />}
          color="blue"
        />
        {(user?.role === 'coordinator' || user?.role === 'lobby') && (
          <StatCard
            title="Estagiários cadastrados"
            value={usersQ.isLoading ? '...' : String(usersQ.data?.length ?? 0)}
            icon={<Users className="h-6 w-6" />}
            color="purple"
            onClick={() => navigate('/trainees')}
          />
        )}
        <StatCard
          title="Concluídos"
          value={
            appointmentsQ.isLoading
              ? '...'
              : String(
                  (appointmentsQ.data ?? []).filter((a) => a.status === 'completed')
                    .length,
                )
          }
          icon={<ClipboardList className="h-6 w-6" />}
          color="green"
        />
      </div>

      {/* Upcoming appointments */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">
            Próximos Agendamentos
          </h2>
          <button
            onClick={() => navigate('/appointments')}
            className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Ver todos
          </button>
        </div>

        {appointmentsQ.isLoading ? (
          <LoadingSpinner centered />
        ) : upcomingAppointments.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            Nenhum agendamento futuro encontrado.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcomingAppointments.map((a) => (
              <div
                key={a.id}
                className="flex cursor-pointer items-center justify-between py-3 hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
                onClick={() => navigate(`/appointments/${a.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {a.patient?.profile?.fullname ?? a.patient?.email ?? `Paciente #${a.patient?.id}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(a.initialDate ?? a.date)} às{' '}
                      {a.time ?? formatTime(a.initialDate ?? a.date)}
                    </p>
                  </div>
                </div>
                <span
                  className={clsx(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                    STATUS_COLORS[a.status ?? 'scheduled'] ??
                      'bg-slate-100 text-slate-600',
                  )}
                >
                  {STATUS_LABELS[a.status ?? 'scheduled'] ?? a.status ?? 'Agendado'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: 'indigo' | 'blue' | 'purple' | 'green'
  onClick?: () => void
}

const COLOR_MAP: Record<StatCardProps['color'], { bg: string; icon: string; border: string }> = {
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-100' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-100' },
}

function StatCard({ title, value, icon, color, onClick }: StatCardProps) {
  const c = COLOR_MAP[color]
  return (
    <div
      className={clsx(
        'rounded-xl border bg-white p-5 shadow-sm transition-shadow',
        onClick && 'cursor-pointer hover:shadow-md',
        c.border,
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={clsx('flex h-12 w-12 items-center justify-center rounded-xl', c.bg, c.icon)}>
          {icon}
        </div>
      </div>
    </div>
  )
}
