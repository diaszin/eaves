import { useQuery } from '@tanstack/react-query'
import { BarChart3 } from 'lucide-react'
import {
  appointmentsService,
  type MonthlyAppointmentCount,
} from '@/features/appointments/services/appointments.service'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'

const MONTHS_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
]
const MONTHS_LONG = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function parseMonth(month: string) {
  const [year, m] = month.split('-').map(Number)
  return { year, index: m - 1 }
}

/** "2026-11" -> "nov/26" */
function shortLabel(month: string) {
  const { year, index } = parseMonth(month)
  return `${MONTHS_SHORT[index]}/${String(year).slice(-2)}`
}

/** "2026-11" -> "novembro de 2026" */
function longLabel(month: string) {
  const { year, index } = parseMonth(month)
  return `${MONTHS_LONG[index]} de ${year}`
}

function countLabel(count: number) {
  return `${count} ${count === 1 ? 'agendamento' : 'agendamentos'}`
}

/** Escolhe um passo "redondo" para o eixo Y com no máximo 5 divisões. */
function axisScale(maxValue: number) {
  const steps = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]
  const step = steps.find((s) => Math.ceil(maxValue / s) <= 5) ?? 1000
  const top = Math.max(step, Math.ceil(maxValue / step) * step)
  const ticks: number[] = []
  for (let v = 0; v <= top; v += step) ticks.push(v)
  return { top, ticks }
}

const WIDTH = 480
const HEIGHT = 240
const PAD = { top: 24, right: 16, bottom: 32, left: 36 }

function Chart({ data }: { data: MonthlyAppointmentCount[] }) {
  const plotW = WIDTH - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const { top, ticks } = axisScale(Math.max(...data.map((d) => d.count)))
  const slot = plotW / data.length
  const barW = Math.min(40, slot * 0.6)
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH

  const summary = data
    .map((d) => `${longLabel(d.month)}: ${countLabel(d.count)}`)
    .join('; ')

  return (
    <>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Gráfico de barras de agendamentos por mês. ${summary}.`}
        className="h-auto w-full max-w-full"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(t)}
              y2={y(t)}
              className="stroke-slate-100"
            />
            <text
              x={PAD.left - 8}
              y={y(t)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-slate-400 text-[10px]"
            >
              {t}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = PAD.left + slot * i + (slot - barW) / 2
          const h = PAD.top + plotH - y(d.count)
          return (
            <g key={d.month} tabIndex={0} className="group outline-none">
              <title>{`${longLabel(d.month)}: ${countLabel(d.count)}`}</title>
              <rect
                x={x}
                y={y(d.count)}
                width={barW}
                height={h}
                rx={4}
                className="fill-indigo-500 transition-colors group-hover:fill-indigo-700 group-focus:fill-indigo-700"
              />
              <text
                x={x + barW / 2}
                y={y(d.count) - 6}
                textAnchor="middle"
                className="fill-slate-700 text-[11px] font-medium"
              >
                {d.count}
              </text>
              <text
                x={x + barW / 2}
                y={HEIGHT - 10}
                textAnchor="middle"
                className="fill-slate-500 text-[11px]"
              >
                {shortLabel(d.month)}
              </text>
            </g>
          )
        })}
      </svg>

      <ul className="sr-only">
        {data.map((d) => (
          <li key={d.month}>
            {longLabel(d.month)}: {countLabel(d.count)}
          </li>
        ))}
      </ul>
    </>
  )
}

export function TraineeAppointmentsChart({ traineeId }: { traineeId: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['appointments', 'monthly', traineeId],
    queryFn: () => appointmentsService.monthlyByProfessional(traineeId),
  })

  const isEmpty = !!data && data.every((d) => d.count === 0)

  return (
    <section className="relative mt-6 min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">
        Agendamentos por mês
      </h3>
      <p className="mb-4 text-sm text-slate-500">Últimos 6 meses</p>

      {isLoading ? (
        <LoadingSpinner centered />
      ) : error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Não foi possível carregar o gráfico.
        </div>
      ) : !data || isEmpty ? (
        <EmptyState
          title="Nenhum agendamento nos últimos 6 meses"
          icon={<BarChart3 className="h-7 w-7" />}
          className="py-8"
        />
      ) : (
        <Chart data={data} />
      )}
    </section>
  )
}
