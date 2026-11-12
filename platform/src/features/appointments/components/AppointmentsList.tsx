import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useLocation } from 'react-router-dom'
import { appointmentsService } from '@/features/appointments/services/appointments.service'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'
import { formatDate } from '@/shared/utils/formatDate'

interface AppointmentsListProps {
  search: string
  onSelect: (id: number) => void
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Ausente',
}

export function AppointmentsList({ search, onSelect }: AppointmentsListProps) {
  const location = useLocation()
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentsService.list(),
  })
  const query = search.toLowerCase()
  const filtered = items.filter((appointment) => {
    const name =
      appointment.patient?.profile?.fullname ??
      appointment.patient?.email ??
      ''
    const status = appointment.status ?? 'scheduled'
    return name.toLowerCase().includes(query) || status.toLowerCase().includes(query)
  })

  if (isLoading) return <LoadingSpinner centered />

  return (
    <ul>
      {filtered.map((appointment) => {
        const isActive =
          location.pathname === `/appointments/${appointment.id}`

        return (
          <li key={appointment.id}>
            <button
              onClick={() => onSelect(appointment.id)}
              className={clsx(
                'w-full border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                isActive && 'border-l-2 border-l-indigo-600 bg-indigo-50',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-slate-800">
                  {appointment.patient?.profile?.fullname ??
                    appointment.patient?.email ??
                    `#${appointment.id}`}
                </span>
                <span className="flex-shrink-0 text-xs text-slate-400">
                  {formatDate(appointment.initialDate ?? appointment.date ?? '')}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {STATUS_LABELS[appointment.status ?? 'scheduled'] ??
                  appointment.status ??
                  'Agendado'}
              </div>
            </button>
          </li>
        )
      })}
      {filtered.length === 0 && (
        <li className="py-10 text-center text-sm text-slate-400">
          Nenhum agendamento encontrado
        </li>
      )}
    </ul>
  )
}
