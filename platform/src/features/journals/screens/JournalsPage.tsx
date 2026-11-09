import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, User, Calendar } from 'lucide-react'
import clsx from 'clsx'
import {
  journalsService,
  MOOD_LABELS,
  MOOD_EMOJIS,
  type JournalEntry,
} from '@/features/journals/services/journals.service'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Avatar } from '@/shared/components/ui/Avatar'

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

const MOOD_COLORS: Record<NonNullable<JournalEntry['mood']>, string> = {
  great: 'bg-green-100 text-green-700 border-green-200',
  good: 'bg-blue-100 text-blue-700 border-blue-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  bad: 'bg-orange-100 text-orange-700 border-orange-200',
  terrible: 'bg-red-100 text-red-700 border-red-200',
}

export default function JournalsPage() {
  const { id } = useParams<{ id?: string }>()

  const detailQ = useQuery({
    queryKey: ['journals', id],
    queryFn: () => journalsService.getById(Number(id)),
    enabled: !!id,
  })

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-slate-100 px-8 py-5">
        <h1 className="text-xl font-semibold text-slate-900">
          Diários dos Pacientes
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Registros de humor e bem-estar dos pacientes
        </p>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        {id ? (
          detailQ.isLoading ? (
            <LoadingSpinner centered />
          ) : detailQ.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              Erro ao carregar entrada de diário.
            </div>
          ) : detailQ.data ? (
            <JournalDetail entry={detailQ.data} />
          ) : null
        ) : (
          <EmptyState
            title="Selecione uma entrada"
            description="Escolha uma entrada de diário na lista à esquerda para ver o conteúdo completo."
            icon={<BookOpen className="h-7 w-7" />}
          />
        )}
      </div>
    </div>
  )
}

function JournalDetail({ entry }: { entry: JournalEntry }) {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Patient info */}
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <Avatar name={entry.patient.profile?.fullname} size="md" />
        <div className="flex-1">
          <h2 className="font-semibold text-slate-900">
            {entry.patient.profile?.fullname ?? entry.patient.email}
          </h2>
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {entry.patient.email}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(entry.createdAt)}
            </span>
          </div>
        </div>

        {/* Mood badge */}
        {entry.mood && (
          <div
            className={clsx(
              'flex flex-col items-center rounded-xl border px-4 py-2',
              MOOD_COLORS[entry.mood],
            )}
          >
            <span className="text-2xl">{MOOD_EMOJIS[entry.mood]}</span>
            <span className="text-xs font-medium">{MOOD_LABELS[entry.mood]}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-800">Entrada do Diário</h3>
        <div className="rounded-lg bg-slate-50 p-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {entry.content}
          </p>
        </div>
        <p className="mt-3 text-right text-xs text-slate-400">
          Escrito em {formatDate(entry.createdAt)}
        </p>
      </div>
    </div>
  )
}
