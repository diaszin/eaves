import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useLocation } from 'react-router-dom'
import { journalsService } from '@/features/journals/services/journals.service'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'
import { formatDate } from '@/shared/utils/formatDate'

interface JournalsListProps {
  search: string
  onSelect: (id: number) => void
}

export function JournalsList({ search, onSelect }: JournalsListProps) {
  const location = useLocation()
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['journals'],
    queryFn: () => journalsService.list(),
  })
  const query = search.toLowerCase()
  const filtered = items.filter((journal) => {
    const name =
      journal.patient?.profile?.fullname ?? journal.patient?.email ?? ''
    return (
      name.toLowerCase().includes(query) ||
      journal.content.toLowerCase().includes(query)
    )
  })

  if (isLoading) return <LoadingSpinner centered />

  return (
    <ul>
      {filtered.map((journal) => {
        const isActive = location.pathname === `/journals/${journal.id}`

        return (
          <li key={journal.id}>
            <button
              onClick={() => onSelect(journal.id)}
              className={clsx(
                'w-full border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                isActive && 'border-l-2 border-l-indigo-600 bg-indigo-50',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-slate-800">
                  {journal.patient?.profile?.fullname ?? journal.patient?.email}
                </span>
                <span className="flex-shrink-0 text-xs text-slate-400">
                  {formatDate(journal.createdAt)}
                </span>
              </div>
              <div className="mt-0.5 truncate text-xs text-slate-500">
                {journal.content.substring(0, 60)}...
              </div>
            </button>
          </li>
        )
      })}
      {filtered.length === 0 && (
        <li className="py-10 text-center text-sm text-slate-400">
          Nenhuma entrada encontrada
        </li>
      )}
    </ul>
  )
}
