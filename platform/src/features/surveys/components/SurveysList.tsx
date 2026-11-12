import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useLocation } from 'react-router-dom'
import { surveysService } from '@/features/surveys/services/surveys.service'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'
import { formatDate } from '@/shared/utils/formatDate'

interface SurveysListProps {
  search: string
  onSelect: (id: number) => void
}

export function SurveysList({ search, onSelect }: SurveysListProps) {
  const location = useLocation()
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: () => surveysService.list(),
  })
  const query = search.toLowerCase()
  const filtered = items.filter((survey) => {
    const name =
      survey.patient?.profile?.fullname ?? survey.patient?.email ?? ''
    return name.toLowerCase().includes(query)
  })

  if (isLoading) return <LoadingSpinner centered />

  return (
    <ul>
      {filtered.map((survey) => {
        const isActive = location.pathname === `/surveys/${survey.id}`

        return (
          <li key={survey.id}>
            <button
              onClick={() => onSelect(survey.id)}
              className={clsx(
                'w-full border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                isActive && 'border-l-2 border-l-indigo-600 bg-indigo-50',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-slate-800">
                  {survey.patient?.profile?.fullname ??
                    survey.patient?.email ??
                    `Paciente #${survey.patient?.id}`}
                </span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  {survey.totalScore}pts
                </span>
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {formatDate(survey.createdAt)}
              </div>
            </button>
          </li>
        )
      })}
      {filtered.length === 0 && (
        <li className="py-10 text-center text-sm text-slate-400">
          Nenhum questionário encontrado
        </li>
      )}
    </ul>
  )
}
