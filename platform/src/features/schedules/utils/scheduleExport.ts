import type { Schedule, ScheduleShift } from '@/features/schedules/services/schedules.service'
import { DAYS_OF_WEEK } from '@/features/schedules/utils/days'
import { buildFileName } from '@/shared/utils/export/download'
import type { ExportDocument } from '@/shared/utils/export/types'

export type ScheduleExportScope = 'single' | 'all'

function fmtDate(value?: string | null): string {
  if (!value) return ''
  // Datas YYYY-MM-DD: formatar sem deslocamento de fuso
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('pt-BR')
}

function dayLabel(s: ScheduleShift): string {
  if (s.customDate) return fmtDate(s.customDate)
  return DAYS_OF_WEEK.find((d) => d.value === s.dayOfWeek)?.label ?? '—'
}

function sortShifts(shifts: ScheduleShift[]): ScheduleShift[] {
  const rank = (s: ScheduleShift) => (s.customDate ? 1 : 0)
  return [...shifts].sort((a, b) => {
    if (rank(a) !== rank(b)) return rank(a) - rank(b)
    if (rank(a) === 0) {
      const d = (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0)
      if (d !== 0) return d
    } else {
      const d = (a.customDate ?? '').localeCompare(b.customDate ?? '')
      if (d !== 0) return d
    }
    return a.startTime.localeCompare(b.startTime)
  })
}

export function countShifts(schedules: Schedule[]): number {
  return schedules.reduce((acc, s) => acc + (s.shifts?.length ?? 0), 0)
}

export function buildScheduleExport(
  schedules: Schedule[],
  scope: ScheduleExportScope,
): ExportDocument {
  const first = schedules[0]
  const person = first.user?.profile?.fullname || first.user?.email || 'Estagiário'
  const all = scope === 'all'

  const meta = [{ label: 'Estagiário', value: person }]
  if (all) {
    meta.push({ label: 'Escalas', value: schedules.map((s) => s.title).join(', ') })
  } else {
    meta.push(
      { label: 'Escala', value: first.title },
      {
        label: 'Período',
        value: `${fmtDate(first.startDate)} a ${
          first.endDate ? fmtDate(first.endDate) : 'sem data de término'
        }`,
      },
      { label: 'Status', value: first.isActive ? 'Ativa' : 'Inativa' },
    )
  }

  const columns = [
    ...(all ? ['Escala'] : []),
    'Dia',
    'Início',
    'Término',
    'Local',
    'Observações',
  ]
  const rows = schedules.flatMap((sch) =>
    sortShifts(sch.shifts ?? []).map((s) => [
      ...(all ? [sch.title] : []),
      dayLabel(s),
      s.startTime,
      s.endTime,
      s.location ?? '',
      s.notes ?? '',
    ]),
  )

  return {
    title: all ? 'Escalas Ativas do Estagiário' : 'Escala de Estágio',
    fileBaseName: buildFileName('escala', person, '').slice(0, -1),
    meta,
    tables: [{ name: 'Horários', columns, rows }],
    generatedAt: new Date().toLocaleString('pt-BR'),
  }
}
