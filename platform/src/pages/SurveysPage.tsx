import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ClipboardList, User, Calendar } from 'lucide-react'
import clsx from 'clsx'
import {
  surveysService,
  PHQ9_QUESTIONS,
  PHQ9_SEVERITY_LABELS,
  type Survey,
} from '@/services/surveys.service'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'

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

const SCORE_LABELS = ['Nunca', 'Vários dias', 'Mais da metade dos dias', 'Quase todo dia']

const SEVERITY_STYLES: Record<Survey['severity'], { bar: string; badge: string }> = {
  minimal: { bar: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
  mild: { bar: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
  moderate: { bar: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700' },
  moderately_severe: { bar: 'bg-red-500', badge: 'bg-red-100 text-red-700' },
  severe: { bar: 'bg-red-700', badge: 'bg-red-200 text-red-800' },
}

export default function SurveysPage() {
  const { id } = useParams<{ id?: string }>()

  const detailQ = useQuery({
    queryKey: ['surveys', id],
    queryFn: () => surveysService.getById(Number(id)),
    enabled: !!id,
  })

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-slate-100 px-8 py-5">
        <h1 className="text-xl font-semibold text-slate-900">
          Questionários PHQ-9
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Escala de Triagem de Depressão — Patient Health Questionnaire
        </p>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        {id ? (
          detailQ.isLoading ? (
            <LoadingSpinner centered />
          ) : detailQ.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              Erro ao carregar questionário.
            </div>
          ) : detailQ.data ? (
            <SurveyDetail survey={detailQ.data} />
          ) : null
        ) : (
          <EmptyState
            title="Selecione um questionário"
            description="Escolha um questionário na lista à esquerda para ver as respostas e pontuação."
            icon={<ClipboardList className="h-7 w-7" />}
          />
        )}
      </div>
    </div>
  )
}

function SurveyDetail({ survey }: { survey: Survey }) {
  const styles = SEVERITY_STYLES[survey.severity]
  const percentage = Math.round((survey.totalScore / 27) * 100)

  return (
    <div className="max-w-2xl space-y-6">
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
                      score === 0 && 'bg-green-100 text-green-700',
                      score === 1 && 'bg-yellow-100 text-yellow-700',
                      score === 2 && 'bg-orange-100 text-orange-700',
                      score === 3 && 'bg-red-100 text-red-700',
                    )}
                  >
                    {score}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {SCORE_LABELS[score] ?? '—'}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
