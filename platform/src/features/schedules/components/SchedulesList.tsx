import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useLocation } from 'react-router-dom'
import { schedulesService } from '@/features/schedules/services/schedules.service'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'
import { formatDate } from '@/shared/utils/formatDate'

interface SchedulesListProps {
  search: string
  onSelect: (id: number) => void
}

export function SchedulesList({ search, onSelect }: SchedulesListProps) {
  const location = useLocation()
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => schedulesService.list(),
  })
  const query = search.toLowerCase()
  const filtered = items.filter((schedule) => {
    const title = schedule.title.toLowerCase()
    const userName = (
      schedule.user?.profile?.fullname ??
      schedule.user?.email ??
      ''
    ).toLowerCase()
    return title.includes(query) || userName.includes(query)
  })

  if (isLoading) return <LoadingSpinner centered />

  return (
    <ul>
      {filtered.map((schedule) => {
        const isActive =
          location.pathname === `/schedules/${schedule.id}`
        const shiftsCount = schedule.shifts?.length ?? 0

        return (
          <li key={schedule.id}>
            <button
              onClick={() => onSelect(schedule.id)}
              className={clsx(
                'w-full border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                isActive && 'border-l-2 border-l-indigo-600 bg-indigo-50',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-slate-800">
                  {schedule.title}
                </span>
                <span
                  className={clsx(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                    schedule.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-500',
                  )}
                >
                  {schedule.isActive ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div className="mt-0.5 truncate text-xs text-slate-600">
                {schedule.user?.profile?.fullname ??
                  schedule.user?.email ??
                  'Sem profissional'}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {shiftsCount}{' '}
                  {shiftsCount === 1
                    ? 'turno configurado'
                    : 'turnos configurados'}
                </span>
                <span>{formatDate(schedule.startDate)}</span>
              </div>
            </button>
          </li>
        )
      })}
      {filtered.length === 0 && (
        <li className="py-10 text-center text-sm text-slate-400">
          Nenhuma escala encontrada
        </li>
      )}
    </ul>
  )
}
