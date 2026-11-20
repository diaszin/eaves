import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useLocation } from 'react-router-dom'
import { surveysService } from '@/features/surveys/services/surveys.service'
import {
  groupByPatient,
  searchPatients,
} from '@/features/surveys/utils/patientSurveys'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'
import { formatDate } from '@/shared/utils/formatDate'

interface SurveysListProps {
  search: string
  onSelect: (patientId: number) => void
}

export function SurveysList({ search, onSelect }: SurveysListProps) {
  const location = useLocation()
  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ['surveys'],
    queryFn: () => surveysService.list(),
  })
  const patients = useMemo(
    () => searchPatients(groupByPatient(items), search),
    [items, search],
  )

  if (isLoading) return <LoadingSpinner centered />
  if (isError) {
    return (
      <p className="p-4 text-sm text-red-600">
        Erro ao carregar pesquisas.
      </p>
    )
  }

  return (
    <ul>
      {patients.map((patient) => {
        const isActive =
          location.pathname === `/surveys/patient/${patient.patientId}`

        return (
          <li key={patient.patientId}>
            <button
              onClick={() => onSelect(patient.patientId)}
              className={clsx(
                'w-full border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50',
                isActive && 'border-l-2 border-l-indigo-600 bg-indigo-50',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-slate-800">
                  {patient.displayName}
                </span>
                <span className="flex-shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  {patient.responseCount}{' '}
                  {patient.responseCount === 1 ? 'resposta' : 'respostas'}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                Última: {formatDate(patient.lastResponseAt)}
              </div>
            </button>
          </li>
        )
      })}
      {patients.length === 0 && (
        <li className="py-10 text-center text-sm text-slate-400">
          Nenhuma pesquisa encontrada
        </li>
      )}
    </ul>
  )
}
