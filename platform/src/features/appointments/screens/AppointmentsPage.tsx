import { useMemo, useState } from 'react'
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, CalendarDays, Clock, User, FileText, X } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/features/auth/contexts/auth'
import {
  appointmentsService,
  type Appointment,
  type CreateAppointmentDto,
  type AppointmentStatus,
} from '@/features/appointments/services/appointments.service'
import { usersService } from '@/features/users/services/users.service'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Avatar } from '@/shared/components/ui/Avatar'
import { PatientAppointmentFilters } from '@/features/appointments/components/PatientAppointmentFilters'
import {
  EMPTY_FILTERS,
  filterAppointments,
  getProfessionalLabel,
  getProfessionalOptions,
  groupByPatient,
  type PatientAppointmentFilters as AppointmentFiltersState,
  type PatientAppointmentSummary,
} from '@/features/appointments/utils/patientAppointments'

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Ausente',
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
  no_show: 'bg-orange-100 text-orange-700 border-orange-200',
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
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

function formatAppointmentTime(appointment: {
  initialDate?: string
  endDate?: string
  time?: string
}) {
  if (!appointment.initialDate) return appointment.time ?? '—'

  const start = new Date(appointment.initialDate)
  if (Number.isNaN(start.getTime())) return '—'

  const startTime = start.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  if (!appointment.endDate) return startTime

  const end = new Date(appointment.endDate)
  if (Number.isNaN(end.getTime())) return startTime

  return `${startTime} - ${end.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

function getAppointmentDuration(appointment: {
  initialDate?: string
  endDate?: string
}) {
  if (!appointment.initialDate || !appointment.endDate) return null

  const minutes =
    (new Date(appointment.endDate).getTime() -
      new Date(appointment.initialDate).getTime()) /
    60_000
  return Number.isFinite(minutes) && minutes >= 0
    ? `${minutes} minutos`
    : null
}

export default function AppointmentsPage() {
  const { id, patientId } = useParams<{ id?: string; patientId?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const canCreate = user?.role === 'coordinator' || user?.role === 'lobby'
  const canEdit = user?.role === 'coordinator' || user?.role === 'lobby'

  // Lista completa (agrupada por paciente); usada pelo perfil e pela rota legada
  const listQ = useQuery({
    queryKey: ['appointments', 'all'],
    queryFn: () => appointmentsService.listAll(),
    enabled: !!id || !!patientId,
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (dto: CreateAppointmentDto) => appointmentsService.create(dto),
    onSuccess: async (data) => {
      // Aguarda a lista atualizar para que a rota legada encontre o novo agendamento.
      await queryClient.invalidateQueries({ queryKey: ['appointments'] })
      setShowForm(false)
      navigate(`/appointments/${data.id}`)
    },
  })

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (apptId: number) => appointmentsService.cancel(apptId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5">
        <h1 className="text-xl font-semibold text-slate-900">
          Agendamentos
        </h1>
        {canCreate && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        {/* New appointment form */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Novo Agendamento</h2>
              <button onClick={() => setShowForm(false)}>
                <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <NewAppointmentForm
              onSubmit={(dto) => createMutation.mutate(dto)}
              isLoading={createMutation.isPending}
              error={createMutation.error?.message}
            />
          </div>
        )}

        {/* Perfil do paciente */}
        {!id && !patientId ? (
          !showForm && (
            <EmptyState
              title="Selecione um paciente"
              description="Escolha um paciente na lista à esquerda para ver seus agendamentos, ou crie um novo."
              icon={<CalendarDays className="h-7 w-7" />}
            />
          )
        ) : listQ.isLoading ? (
          <LoadingSpinner centered />
        ) : listQ.error || !listQ.data ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p>Erro ao carregar agendamentos.</p>
            <button
              type="button"
              onClick={() => listQ.refetch()}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        ) : id ? (
          <LegacyAppointmentRedirect
            appointmentId={Number(id)}
            appointments={listQ.data}
          />
        ) : (
          <PatientProfileLoader
            patientId={Number(patientId)}
            appointments={listQ.data}
            canEdit={canEdit}
            onCancel={(apptId) => cancelMutation.mutate(apptId)}
            isCancelling={cancelMutation.isPending}
          />
        )}
      </div>
    </div>
  )
}

function LegacyAppointmentRedirect({
  appointmentId,
  appointments,
}: {
  appointmentId: number
  appointments: Appointment[]
}) {
  const appointment = appointments.find((a) => a.id === appointmentId)
  if (!appointment?.patient) {
    return (
      <EmptyState
        title="Agendamento não encontrado"
        icon={<CalendarDays className="h-7 w-7" />}
      />
    )
  }
  return (
    <Navigate
      to={`/appointments/patient/${appointment.patient.id}?appointment=${appointment.id}`}
      replace
    />
  )
}

function PatientProfileLoader({
  patientId,
  appointments,
  canEdit,
  onCancel,
  isCancelling,
}: {
  patientId: number
  appointments: Appointment[]
  canEdit: boolean
  onCancel: (id: number) => void
  isCancelling: boolean
}) {
  const patient = useMemo(
    () => groupByPatient(appointments).find((p) => p.patientId === patientId),
    [appointments, patientId],
  )
  if (!patient) {
    return (
      <EmptyState
        title="Paciente não encontrado"
        icon={<User className="h-7 w-7" />}
      />
    )
  }
  return (
    <PatientProfile
      key={patient.patientId}
      patient={patient}
      canEdit={canEdit}
      onCancel={onCancel}
      isCancelling={isCancelling}
    />
  )
}

function PatientProfile({
  patient,
  canEdit,
  onCancel,
  isCancelling,
}: {
  patient: PatientAppointmentSummary
  canEdit: boolean
  onCancel: (id: number) => void
  isCancelling: boolean
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<AppointmentFiltersState>(EMPTY_FILTERS)

  const professionals = useMemo(
    () => getProfessionalOptions(patient.appointments),
    [patient.appointments],
  )
  const filtered = useMemo(
    () => filterAppointments(patient.appointments, filters),
    [patient.appointments, filters],
  )

  const requestedId = Number(searchParams.get('appointment'))
  const selected =
    filtered.find((a) => a.id === requestedId) ?? filtered[0] ?? null

  // A listagem não traz as observações; o detalhe completo vem de getById.
  const detailQ = useQuery({
    queryKey: ['appointments', selected?.id],
    queryFn: () => appointmentsService.getById(selected!.id),
    enabled: !!selected,
  })

  return (
    <div className="max-w-5xl space-y-6">
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
              <CalendarDays className="h-3 w-3" />
              {patient.appointmentCount}{' '}
              {patient.appointmentCount === 1 ? 'agendamento' : 'agendamentos'}
            </span>
          </div>
        </div>
      </div>

      <PatientAppointmentFilters
        filters={filters}
        professionals={professionals}
        onChange={setFilters}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum agendamento encontrado para os filtros selecionados"
          icon={<CalendarDays className="h-7 w-7" />}
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
          <ul className="space-y-2" aria-label="Histórico de agendamentos">
            {filtered.map((appointment) => (
              <li key={appointment.id}>
                <button
                  type="button"
                  onClick={() =>
                    setSearchParams(
                      { appointment: String(appointment.id) },
                      { replace: true },
                    )
                  }
                  className={clsx(
                    'w-full rounded-xl border bg-white p-3 text-left shadow-sm transition-colors hover:bg-slate-50',
                    selected?.id === appointment.id
                      ? 'border-indigo-500 ring-1 ring-indigo-500'
                      : 'border-slate-200',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-sm font-medium text-slate-800">
                      <CalendarDays className="h-3 w-3 text-slate-400" />
                      {formatDate(appointment.initialDate ?? appointment.date)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatAppointmentTime(appointment)}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-500">
                    {getProfessionalLabel(appointment)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div>
            {detailQ.isLoading ? (
              <LoadingSpinner centered />
            ) : detailQ.error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
                <p>Erro ao carregar agendamento.</p>
                <button
                  type="button"
                  onClick={() => detailQ.refetch()}
                  className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Tentar novamente
                </button>
              </div>
            ) : detailQ.data ? (
              <AppointmentDetail
                appointment={detailQ.data}
                canEdit={canEdit}
                onCancel={() => onCancel(detailQ.data!.id)}
                isCancelling={isCancelling}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

// ----- Detail component -----

function AppointmentDetail({
  appointment,
  canEdit,
  onCancel,
  isCancelling,
}: {
  appointment: Awaited<ReturnType<typeof appointmentsService.getById>>
  canEdit: boolean
  onCancel: () => void
  isCancelling: boolean
}) {
  const status = appointment.status ?? 'scheduled'
  const date = appointment.initialDate ?? appointment.date
  const duration = getAppointmentDuration(appointment)
  const isCancellable =
    status === 'scheduled' || status === 'confirmed'

  return (
    <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {appointment.patient?.profile?.fullname ??
              appointment.patient?.email ??
              `Paciente #${appointment.patient?.id}`}
          </h2>
          <p className="text-sm text-slate-500">ID do agendamento: #{appointment.id}</p>
        </div>
        <span
          className={clsx(
            'rounded-full border px-3 py-1 text-sm font-medium',
            STATUS_COLORS[status],
          )}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <InfoField
          icon={<CalendarDays className="h-4 w-4" />}
          label="Data"
          value={formatDate(date)}
        />
        <InfoField
          icon={<Clock className="h-4 w-4" />}
          label="Horário"
          value={formatAppointmentTime(appointment)}
        />
        {duration && (
          <InfoField
            icon={<Clock className="h-4 w-4" />}
            label="Duração"
            value={duration}
          />
        )}
        <InfoField
          icon={<User className="h-4 w-4" />}
          label="Profissional"
          value={getProfessionalLabel(appointment)}
        />
        <InfoField
          icon={<User className="h-4 w-4" />}
          label="Paciente"
          value={
            appointment.patient?.profile?.fullname ??
            appointment.patient?.email ??
            '—'
          }
        />
      </div>

      {appointment.notes && (
        <div className="mb-6 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-600">
            <FileText className="h-4 w-4" />
            Observações
          </div>
          <p className="text-sm text-slate-700">{appointment.notes}</p>
        </div>
      )}

      {canEdit && isCancellable && (
        <div className="flex gap-3">
          <Button
            variant="danger"
            size="sm"
            onClick={onCancel}
            isLoading={isCancelling}
          >
            Cancelar Agendamento
          </Button>
        </div>
      )}
    </div>
  )
}

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </div>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

// ----- New Appointment Form -----

function NewAppointmentForm({
  onSubmit,
  isLoading,
  error,
}: {
  onSubmit: (dto: CreateAppointmentDto) => void
  isLoading: boolean
  error?: string
}) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [professionalId, setProfessionalId] = useState('')
  const [notes, setNotes] = useState('')
  const professionalsQ = useQuery({
    queryKey: ['employees', 'trainee'],
    queryFn: () => usersService.list({ role: 'trainee' }),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !time || !patientEmail || !professionalId) return
    onSubmit({
      initialDate: new Date(`${date}T${time}`).toISOString(),
      patientEmail,
      professionalId: Number(professionalId),
      notes: notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
      <Input
        label="Data"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <Input
        label="Horário"
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
      />
      <Input
        label="E-mail do Paciente"
        type="email"
        placeholder="paciente@exemplo.com"
        value={patientEmail}
        onChange={(e) => setPatientEmail(e.target.value)}
        required
      />
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        Profissional (Estagiário)
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors hover:border-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          value={professionalId}
          onChange={(e) => setProfessionalId(e.target.value)}
          required
          disabled={professionalsQ.isLoading || !professionalsQ.data?.length}
        >
          <option value="">
            {professionalsQ.isLoading
              ? 'Carregando estagiários...'
              : 'Selecione um estagiário'}
          </option>
          {professionalsQ.data?.map((professional) => (
            <option key={professional.id} value={professional.id}>
              {professional.profile?.fullname ?? `Estagiário #${professional.id}`}
            </option>
          ))}
        </select>
        {professionalsQ.error && (
          <span className="text-xs font-normal text-red-600">
            Erro ao carregar a lista de estagiários.
          </span>
        )}
        {!professionalsQ.isLoading &&
          !professionalsQ.error &&
          professionalsQ.data?.length === 0 && (
            <span className="text-xs font-normal text-slate-500">
              Nenhum estagiário disponível.
            </span>
          )}
      </label>
      <Input
        label="Observações"
        placeholder="Observações opcionais"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {error && (
        <div className="col-span-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <div className="col-span-2 flex gap-2">
        <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
          Criar Agendamento
        </Button>
      </div>
    </form>
  )
}
