import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useLocation } from 'react-router-dom'
import { usersService } from '@/features/users/services/users.service'
import { Badge } from '@/shared/components/ui/Badge'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'

interface TraineesListProps {
  search: string
  onSelect: (id: number) => void
  userRole?: string
}

export function TraineesList({
  search,
  onSelect,
  userRole,
}: TraineesListProps) {
  const location = useLocation()
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.list({ role: 'trainee' }),
  })
  const query = search.toLowerCase()
  const filtered = items.filter((user) => {
    const name = user.profile?.fullname ?? ''
    return name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
  })

  if (isLoading) return <LoadingSpinner centered />

  const visible =
    userRole === 'lobby'
      ? filtered.filter((user) => user.role !== 'coordinator')
      : filtered

  return (
    <ul>
      {visible.map((user) => {
        const isActive = location.pathname === `/trainees/${user.id}`

        return (
          <li key={user.id}>
            <button
              onClick={() => onSelect(user.id)}
              className={clsx(
                'w-full border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                isActive && 'border-l-2 border-l-indigo-600 bg-indigo-50',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-slate-800">
                  {user.profile?.fullname ?? user.email}
                </span>
                <Badge role={user.role} />
              </div>
              <div className="mt-0.5 truncate text-xs text-slate-500">
                {user.email}
              </div>
            </button>
          </li>
        )
      })}
      {visible.length === 0 && (
        <li className="py-10 text-center text-sm text-slate-400">
          Nenhum usuário encontrado
        </li>
      )}
    </ul>
  )
}
