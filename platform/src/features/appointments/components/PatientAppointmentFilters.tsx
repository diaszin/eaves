import { X } from 'lucide-react'
import {
  EMPTY_FILTERS,
  hasActiveFilters,
  type PatientAppointmentFilters as Filters,
  type ProfessionalOption,
} from '@/features/appointments/utils/patientAppointments'
import { Input } from '@/shared/components/ui/Input'
import { isDateRangeValid } from '@/shared/utils/dateRange'

interface PatientAppointmentFiltersProps {
  filters: Filters
  professionals: ProfessionalOption[]
  onChange: (filters: Filters) => void
}

export function PatientAppointmentFilters({
  filters,
  professionals,
  onChange,
}: PatientAppointmentFiltersProps) {
  const rangeValid = isDateRangeValid(filters.from, filters.to)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <Input
            label="De"
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(e) => onChange({ ...filters, from: e.target.value })}
          />
        </div>
        <div className="w-40">
          <Input
            label="Até"
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(e) => onChange({ ...filters, to: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="appointment-professional-filter"
            className="text-sm font-medium text-slate-700"
          >
            Profissional
          </label>
          <select
            id="appointment-professional-filter"
            value={filters.professionalId}
            onChange={(e) =>
              onChange({ ...filters, professionalId: e.target.value })
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors hover:border-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">Todos</option>
            {professionals.map((professional) => (
              <option key={professional.id} value={String(professional.id)}>
                {professional.label}
              </option>
            ))}
          </select>
        </div>
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </button>
        )}
      </div>
      {!rangeValid && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          A data inicial não pode ser posterior à final.
        </p>
      )}
    </div>
  )
}
