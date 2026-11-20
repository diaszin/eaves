import { useMemo, useState, type ReactNode } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ClipboardList, User, Calendar } from 'lucide-react'
import clsx from 'clsx'
import {
  surveysService,
  PHQ9_QUESTIONS,
  PHQ9_SEVERITY_LABELS,
  SCORE_LABELS,
  getCategoryLabel,
  type Survey,
} from '@/features/surveys/services/surveys.service'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Avatar } from '@/shared/components/ui/Avatar'
import { ExportMenu } from '@/shared/components/ui/ExportMenu'
import { exportDocument } from '@/shared/utils/export/download'
import {
  EMPTY_FILTERS,
  filterSurveys,
  getAvailableCategories,
  groupByPatient,
  type PatientSurveyFilters as SurveyFiltersState,
  type PatientSurveySummary,
} from '@/features/surveys/utils/patientSurveys'
import { PatientSurveyFilters } from '@/features/surveys/components/PatientSurveyFilters'
import { buildSurveyExport } from '@/features/surveys/utils/surveyExport'

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const SEVERITY_STYLES: Record<Survey['severity'], { bar: string; badge: string }> = {
  minimal: { bar: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
  mild: { bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
  moderate: { bar: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700' },
  moderately_severe: { bar: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
  severe: { bar: 'bg-red-700', badge: 'bg-red-200 text-red-800' },
}

export default function SurveysPage() {
  const { id, patientId } = useParams<{ id?: string; patientId?: string }>()

  const listQ = useQuery({
    queryKey: ['surveys'],
    queryFn: () => surveysService.list(),
    enabled: !!id || !!patientId,
  })

  let content: ReactNode
  if (!id && !patientId) {
    content = (
      <EmptyState
        title="Selecione um paciente"
        description="Escolha um paciente na lista à esquerda para ver suas pesquisas."
        icon={<ClipboardList className="h-7 w-7" />}
      />
    )
  } else if (listQ.isLoading) {
    content = <LoadingSpinner centered />
  } else if (listQ.error || !listQ.data) {
    content = (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Erro ao carregar pesquisas.
      </div>
    )
  } else if (id) {
    // Rota legada /surveys/:id (id de uma resposta): abre o perfil do paciente dono.
    const survey = listQ.data.find((s) => s.id === Number(id))
    content = survey ? (
      <Navigate
        to={`/surveys/patient/${survey.patient.id}?response=${survey.id}`}
        replace
      />
    ) : (
      <EmptyState
        title="Questionário não encontrado"
        icon={<ClipboardList className="h-7 w-7" />}
      />
    )
  } else {
    const patient = groupByPatient(listQ.data).find(
      (p) => p.patientId === Number(patientId),
    )
    content = patient ? (
      <PatientProfile key={patient.patientId} patient={patient} />
    ) : (
      <EmptyState
        title="Paciente não encontrado"
        icon={<User className="h-7 w-7" />}
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-slate-100 px-8 py-5">
        <h1 className="text-xl font-semibold text-slate-900">Pesquisas</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Respostas dos pacientes agrupadas por pessoa — PHQ-9 (Patient Health
          Questionnaire)
        </p>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">{content}</div>
    </div>
  )
}

function PatientProfile({ patient }: { patient: PatientSurveySummary }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<SurveyFiltersState>(EMPTY_FILTERS)

  const categories = useMemo(
    () => getAvailableCategories(patient.surveys),
    [patient.surveys],
  )
  const filtered = useMemo(
    () => filterSurveys(patient.surveys, filters),
    [patient.surveys, filters],
  )

  const requestedId = Number(searchParams.get('response'))
  const selected =
    filtered.find((s) => s.id === requestedId) ?? filtered[0] ?? null

  return (
    <div className="max-w-4xl space-y-6">
      {/* Patient info */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <Avatar name={patient.displayName} size="md" />
        <div className="flex-1">
          <h2 className="font-semibold text-slate-900">{patient.displayName}</h2>
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {patient.email}
            </span>
            <span className="flex items-center gap-1">
              <ClipboardList className="h-3 w-3" />
              {patient.responseCount}{' '}
              {patient.responseCount === 1 ? 'resposta' : 'respostas'}
            </span>
          </div>
        </div>
      </div>

      <PatientSurveyFilters
        filters={filters}
        categories={categories}
        onChange={setFilters}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma pesquisa encontrada para os filtros selecionados"
          icon={<ClipboardList className="h-7 w-7" />}
          action={
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Limpar filtros
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <ul className="space-y-2" aria-label="Histórico de pesquisas">
            {filtered.map((survey) => (
              <li key={survey.id}>
                <button
                  type="button"
                  onClick={() =>
                    setSearchParams({ response: String(survey.id) }, { replace: true })
                  }
                  className={clsx(
                    'w-full rounded-xl border bg-white p-3 text-left shadow-sm transition-colors hover:bg-slate-50',
                    selected?.id === survey.id
                      ? 'border-indigo-500 ring-1 ring-indigo-500'
                      : 'border-slate-200',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-sm font-medium text-slate-800">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {formatDate(survey.createdAt)}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {survey.totalScore}
                      <span className="text-xs font-normal text-slate-400">/27</span>
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500">
                      {getCategoryLabel(survey.category)}
                    </span>
                    <span
                      className={clsx(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        SEVERITY_STYLES[survey.severity].badge,
                      )}
                    >
                      {PHQ9_SEVERITY_LABELS[survey.severity]}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          {selected && <SurveyDetail key={selected.id} survey={selected} />}
        </div>
      )}
    </div>
  )
}

function SurveyDetail({ survey }: { survey: Survey }) {
  const styles = SEVERITY_STYLES[survey.severity]
  const percentage = Math.round((survey.totalScore / 27) * 100)

  return (
    <div className="space-y-6">
      {/* Patient info */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <Avatar name={survey.patient.profile?.fullname} size="md" />
        <div className="flex-1">
          <h2 className="font-semibold text-slate-900">
            {survey.patient.profile?.fullname ?? survey.patient.email}
          </h2>
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {survey.patient.email}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(survey.createdAt)}
            </span>
          </div>
        </div>
        <ExportMenu
          onExport={(format) => exportDocument(buildSurveyExport(survey), format)}
        />
      </div>

      {/* Score summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Pontuação Total</p>
            <p className="text-4xl font-bold text-slate-900">
              {survey.totalScore}
              <span className="text-lg font-normal text-slate-400">/27</span>
            </p>
          </div>
          <div
            className={clsx(
              'rounded-xl px-4 py-2 text-center',
              styles.badge,
            )}
          >
            <p className="text-xs font-medium opacity-70">Severidade</p>
            <p className="font-semibold">
              {PHQ9_SEVERITY_LABELS[survey.severity]}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={clsx('h-full rounded-full transition-all', styles.bar)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>0 — Mínima</span>
          <span>27 — Grave</span>
        </div>
      </div>

      {/* Questions & Answers */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-800">Respostas por Questão</h3>
        <div className="space-y-4">
          {PHQ9_QUESTIONS.map((question, idx) => {
            const answer = survey.answers?.find((a) => a.questionIndex === idx)
            const score = answer?.score ?? 0
            const answered = !!answer
            return (
              <div key={idx} className="rounded-lg bg-slate-50 p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium text-slate-900">{idx + 1}.</span>{' '}
                    {question}
                  </p>
                  <span
                    className={clsx(
                      'flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-bold',
                      !answered && 'bg-slate-100 text-slate-500',
                      answered && score === 0 && 'bg-green-100 text-green-700',
                      score === 1 && 'bg-yellow-100 text-yellow-700',
                      score === 2 && 'bg-orange-100 text-orange-700',
                      score === 3 && 'bg-red-100 text-red-700',
                    )}
                  >
                    {answered ? score : '—'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {answered ? (SCORE_LABELS[score] ?? '—') : 'Sem resposta'}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
