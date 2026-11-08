import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  CalendarRange,
  Clock,
  User,
  MapPin,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/lib/auth'
import {
  schedulesService,
  type Schedule,
  type ScheduleShift,
  type CreateScheduleDto,
  type UpdateScheduleDto,
} from '@/services/schedules.service'
import { usersService } from '@/services/users.service'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda-feira', short: 'Seg' },
  { value: 2, label: 'Terça-feira', short: 'Ter' },
  { value: 3, label: 'Quarta-feira', short: 'Qua' },
  { value: 4, label: 'Quinta-feira', short: 'Qui' },
  { value: 5, label: 'Sexta-feira', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
]

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Não informada'
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function calculateDurationHours(startTime: string, endTime: string): number {
  try {
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    const startTotal = startH * 60 + startM
    const endTotal = endH * 60 + endM
    return Math.max(0, (endTotal - startTotal) / 60)
  } catch {
    return 0
  }
}

interface ShiftFormItem {
  key: string
  type: 'recurring' | 'custom'
  dayOfWeek: number
  customDate: string
  startTime: string
  endTime: string
  location: string
  notes: string
  maxCapacity: number
}

export default function SchedulesPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

  const canManage = user?.role === 'coordinator' || user?.role === 'professor'

  // Query detalhe
  const detailQ = useQuery({
    queryKey: ['schedules', id],
    queryFn: () => schedulesService.getById(Number(id)),
    enabled: !!id,
  })

  // Query lista geral
  const listQ = useQuery({
    queryKey: ['schedules'],
    queryFn: () => schedulesService.list(),
  })

  // Query usuários para o select do form
  const usersQ = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.list(),
    enabled: showModal,
  })

  // Mutações
  const createMutation = useMutation({
    mutationFn: (dto: CreateScheduleDto) => schedulesService.create(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      setShowModal(false)
      navigate(`/schedules/${data.id}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ schedId, dto }: { schedId: number; dto: UpdateScheduleDto }) =>
      schedulesService.update(schedId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      queryClient.invalidateQueries({ queryKey: ['schedules', id] })
      setShowModal(false)
      setEditingSchedule(null)
    },
  })

  const removeMutation = useMutation({
    mutationFn: (schedId: number) => schedulesService.remove(schedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      navigate('/schedules')
    },
  })

  function handleOpenCreate() {
    setEditingSchedule(null)
    setShowModal(true)
  }

  function handleOpenEdit(schedule: Schedule) {
    setEditingSchedule(schedule)
    setShowModal(true)
  }

  function handleDelete(schedId: number) {
    if (confirm('Tem certeza que deseja remover esta escala? Todos os turnos associados serão excluídos.')) {
      removeMutation.mutate(schedId)
    }
  }

  const selectedSchedule = detailQ.data

  return (
    <div className="flex h-full flex-col bg-slate-50/50">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {selectedSchedule ? selectedSchedule.title : 'Escalas de Atendimento'}
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {selectedSchedule
              ? 'Gerenciamento de turnos, dias e horários customizados'
              : 'Definição e organização de escalas e horários customizados para a equipe'}
          </p>
        </div>

        {canManage && (
          <Button variant="primary" size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" />
            Nova Escala
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-8">
        {id ? (
          // DETALHE DA ESCALA SELECIONADA
          detailQ.isLoading ? (
            <LoadingSpinner centered />
          ) : detailQ.isError || !selectedSchedule ? (
            <EmptyState
              icon={<CalendarRange className="h-7 w-7 text-slate-400" />}
              title="Escala não encontrada"
              description="A escala solicitada não existe ou foi removida."
              action={
                <Button variant="secondary" onClick={() => navigate('/schedules')}>
                  Voltar para lista
                </Button>
              }
            />
          ) : (
            <ScheduleDetailView
              schedule={selectedSchedule}
              canManage={canManage}
              onEdit={() => handleOpenEdit(selectedSchedule)}
              onDelete={() => handleDelete(selectedSchedule.id)}
            />
          )
        ) : (
          // VISÃO GERAL / DASHBOARD DE ESCALAS
          <SchedulesOverview
            schedules={listQ.data ?? []}
            isLoading={listQ.isLoading}
            canManage={canManage}
            onOpenCreate={handleOpenCreate}
            onSelect={(schedId) => navigate(`/schedules/${schedId}`)}
          />
        )}
      </div>

      {/* Modal de Criação / Edição */}
      {showModal && (
        <ScheduleModal
          initialSchedule={editingSchedule}
          availableUsers={usersQ.data ?? []}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onClose={() => {
            setShowModal(false)
            setEditingSchedule(null)
          }}
          onSubmit={(dto) => {
            if (editingSchedule) {
              updateMutation.mutate({ schedId: editingSchedule.id, dto })
            } else {
              createMutation.mutate(dto)
            }
          }}
        />
      )}
    </div>
  )
}

// -------------------------------------------------------------
// Componente de Detalhe da Escala
// -------------------------------------------------------------
function ScheduleDetailView({
  schedule,
  canManage,
  onEdit,
  onDelete,
}: {
  schedule: Schedule
  canManage: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const shifts = schedule.shifts || []

  // Agrupamento de turnos recorrentes por dia da semana
  const recurringShifts = shifts.filter((s) => s.dayOfWeek !== null && s.dayOfWeek !== undefined)
  const customDateShifts = shifts.filter((s) => s.customDate)

  // Cálculo total de horas semanais recorrentes
  const totalWeeklyHours = recurringShifts.reduce(
    (acc, curr) => acc + calculateDurationHours(curr.startTime, curr.endTime),
    0,
  )

  return (
    <div className="space-y-6">
      {/* Header Info Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarRange className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">{schedule.title}</h2>
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    schedule.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600',
                  )}
                >
                  {schedule.isActive ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      Ativa
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-slate-500" />
                      Inativa
                    </>
                  )}
                </span>
              </div>
              {schedule.description && (
                <p className="mt-1 text-sm text-slate-600">{schedule.description}</p>
              )}
            </div>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={onEdit}>
                <Edit2 className="h-4 w-4" />
                Editar Escala
              </Button>
              <Button variant="danger" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          )}
        </div>

        {/* Metadados e Profissional */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Avatar name={schedule.user?.profile?.fullname || schedule.user?.email || 'User'} size="md" />
            <div>
              <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Profissional Escalado
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {schedule.user?.profile?.fullname || schedule.user?.email}
              </span>
              {schedule.user?.role && (
                <Badge role={schedule.user.role as any} className="mt-1 ml-0.5" />
              )}
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
              Vigência da Escala
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{formatDate(schedule.startDate)}</span>
              <span className="text-slate-400">até</span>
              <span>{schedule.endDate ? formatDate(schedule.endDate) : 'Indeterminado'}</span>
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
              Carga Semanal Estimada
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-indigo-700">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>{totalWeeklyHours} horas / semana</span>
              <span className="text-xs font-normal text-slate-500">
                ({shifts.length} {shifts.length === 1 ? 'turno configurado' : 'turnos configurados'})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grade de Turnos por Dias da Semana */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Grade Semanal Recorrente</h3>
            <p className="text-xs text-slate-500">
              Dias e horários customizados semanais de atendimento e supervisão
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {recurringShifts.length} {recurringShifts.length === 1 ? 'turno' : 'turnos'}
          </span>
        </div>

        {recurringShifts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
            Nenhum turno semanal recorrente configurado para esta escala.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DAYS_OF_WEEK.map((day) => {
              const dayShifts = recurringShifts.filter((s) => s.dayOfWeek === day.value)
              if (dayShifts.length === 0) return null

              return (
                <div
                  key={day.value}
                  className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="font-semibold text-slate-800">{day.label}</span>
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                      {dayShifts.length} {dayShifts.length === 1 ? 'horário' : 'horários'}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {dayShifts.map((shift, idx) => {
                      const duration = calculateDurationHours(shift.startTime, shift.endTime)
                      return (
                        <div
                          key={shift.id || idx}
                          className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                              <Clock className="h-4 w-4 text-indigo-600" />
                              {shift.startTime} - {shift.endTime}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                              {duration}h
                            </span>
                          </div>

                          {shift.location && (
                            <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-600">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{shift.location}</span>
                            </div>
                          )}

                          {shift.notes && (
                            <p className="mt-1.5 text-xs text-slate-500 italic">
                              "{shift.notes}"
                            </p>
                          )}

                          {shift.maxCapacity && shift.maxCapacity > 1 && (
                            <div className="mt-1.5 text-xs text-indigo-600 font-medium">
                              Capacidade: até {shift.maxCapacity} atendimentos simultâneos
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Datas Específicas / Turnos Customizados Pontuais */}
      {customDateShifts.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">
              Dias e Horários Específicos (Não Recorrentes)
            </h3>
            <p className="text-xs text-slate-500">
              Datas pontuais e plantões extraordinários cadastrados nesta escala
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {customDateShifts.map((shift, idx) => (
              <div
                key={shift.id || idx}
                className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-indigo-900">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    {formatDate(shift.customDate)}
                  </span>
                  <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800">
                    {shift.startTime} - {shift.endTime}
                  </span>
                </div>

                {shift.location && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{shift.location}</span>
                  </div>
                )}

                {shift.notes && (
                  <p className="mt-2 text-xs text-slate-600 italic">
                    "{shift.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// Componente de Visão Geral / Dashboard das Escalas
// -------------------------------------------------------------
function SchedulesOverview({
  schedules,
  isLoading,
  canManage,
  onOpenCreate,
  onSelect,
}: {
  schedules: Schedule[]
  isLoading: boolean
  canManage: boolean
  onOpenCreate: () => void
  onSelect: (id: number) => void
}) {
  if (isLoading) return <LoadingSpinner centered />

  const activeSchedules = schedules.filter((s) => s.isActive)
  const totalShifts = schedules.reduce((acc, s) => acc + (s.shifts?.length || 0), 0)

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Total de Escalas
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">{schedules.length}</span>
            <CalendarRange className="h-6 w-6 text-indigo-500" />
          </div>
          <span className="mt-1 block text-xs text-slate-500">
            {activeSchedules.length} ativas em execução
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Turnos Customizados
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">{totalShifts}</span>
            <Clock className="h-6 w-6 text-green-500" />
          </div>
          <span className="mt-1 block text-xs text-slate-500">
            Dias e faixas horárias parametrizadas
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Profissionais Escalados
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900">
              {new Set(schedules.map((s) => s.user?.id)).size}
            </span>
            <User className="h-6 w-6 text-purple-500" />
          </div>
          <span className="mt-1 block text-xs text-slate-500">
            Estagiários, professores e acolhedores
          </span>
        </div>
      </div>

      {/* Grid de Escalas Cadastradas */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Todas as Escalas</h2>
            <p className="text-xs text-slate-500">
              Selecione uma escala para inspecionar os dias e horários detalhados
            </p>
          </div>
          {canManage && (
            <Button variant="secondary" size="sm" onClick={onOpenCreate}>
              <Plus className="h-4 w-4" />
              Criar Nova
            </Button>
          )}
        </div>

        {schedules.length === 0 ? (
          <EmptyState
            icon={<CalendarRange className="h-7 w-7 text-slate-400" />}
            title="Nenhuma escala cadastrada"
            description="Cadastre escalas de trabalho e atendimento para organizar a atuação dos estagiários e professores."
            action={
              canManage && (
                <Button variant="primary" onClick={onOpenCreate}>
                  <Plus className="h-4 w-4" />
                  Cadastrar Primeira Escala
                </Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {schedules.map((schedule) => {
              const shifts = schedule.shifts || []
              return (
                <div
                  key={schedule.id}
                  onClick={() => onSelect(schedule.id)}
                  className="group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-400 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {schedule.title}
                    </h3>
                    <span
                      className={clsx(
                        'rounded-full px-2 py-0.5 text-xs font-semibold flex-shrink-0',
                        schedule.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-500',
                      )}
                    >
                      {schedule.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  {schedule.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {schedule.description}
                    </p>
                  )}

                  {/* Usuário vinculado */}
                  <div className="mt-4 flex items-center gap-2.5 border-t border-slate-100 pt-3">
                    <Avatar
                      name={schedule.user?.profile?.fullname || schedule.user?.email || 'User'}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-slate-800">
                        {schedule.user?.profile?.fullname || schedule.user?.email}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {schedule.user?.role}
                      </span>
                    </div>
                  </div>

                  {/* Turnos e vigência */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 font-medium text-indigo-600">
                      <Clock className="h-3.5 w-3.5" />
                      {shifts.length} {shifts.length === 1 ? 'turno configurado' : 'turnos configurados'}
                    </span>
                    <span>{formatDate(schedule.startDate)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// Modal de Criação / Edição de Escala com Turnos Customizados
// -------------------------------------------------------------
function ScheduleModal({
  initialSchedule,
  availableUsers,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  initialSchedule: Schedule | null
  availableUsers: any[]
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (dto: CreateScheduleDto) => void
}) {
  const [title, setTitle] = useState(initialSchedule?.title ?? '')
  const [description, setDescription] = useState(initialSchedule?.description ?? '')
  const [userId, setUserId] = useState<number>(
    initialSchedule?.user?.id ?? availableUsers[0]?.id ?? 0,
  )
  const [startDate, setStartDate] = useState(
    initialSchedule?.startDate ? initialSchedule.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
  )
  const [endDate, setEndDate] = useState(
    initialSchedule?.endDate ? initialSchedule.endDate.slice(0, 10) : '',
  )
  const [isActive, setIsActive] = useState(initialSchedule?.isActive ?? true)

  // Lista dinâmica de turnos customizados
  const [shifts, setShifts] = useState<ShiftFormItem[]>(() => {
    if (initialSchedule?.shifts && initialSchedule.shifts.length > 0) {
      return initialSchedule.shifts.map((s) => ({
        key: String(Math.random()),
        type: s.customDate ? 'custom' : 'recurring',
        dayOfWeek: s.dayOfWeek !== null && s.dayOfWeek !== undefined ? s.dayOfWeek : 1,
        customDate: s.customDate ?? '',
        startTime: s.startTime || '08:00',
        endTime: s.endTime || '12:00',
        location: s.location ?? '',
        notes: s.notes ?? '',
        maxCapacity: s.maxCapacity ?? 1,
      }))
    }
    // Padrão inicial: Segunda 08:00 às 12:00
    return [
      {
        key: 'initial-1',
        type: 'recurring',
        dayOfWeek: 1,
        customDate: '',
        startTime: '08:00',
        endTime: '12:00',
        location: 'Consultório 1',
        notes: 'Atendimento Clínico',
        maxCapacity: 1,
      },
    ]
  })

  function handleAddShift(preset?: { start: string; end: string; notes: string }) {
    setShifts((prev) => [
      ...prev,
      {
        key: String(Date.now() + Math.random()),
        type: 'recurring',
        dayOfWeek: 1,
        customDate: '',
        startTime: preset ? preset.start : '14:00',
        endTime: preset ? preset.end : '18:00',
        location: 'Consultório 1',
        notes: preset ? preset.notes : 'Atendimento',
        maxCapacity: 1,
      },
    ])
  }

  function handleRemoveShift(key: string) {
    setShifts((prev) => prev.filter((s) => s.key !== key))
  }

  function handleUpdateShift(key: string, updates: Partial<ShiftFormItem>) {
    setShifts((prev) =>
      prev.map((s) => (s.key === key ? { ...s, ...updates } : s)),
    )
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      alert('Por favor, informe o título da escala.')
      return
    }
    if (!userId) {
      alert('Por favor, selecione o profissional escalado.')
      return
    }
    if (!startDate) {
      alert('Por favor, informe a data inicial.')
      return
    }

    const payloadShifts: ScheduleShift[] = shifts.map((s) => ({
      dayOfWeek: s.type === 'recurring' ? s.dayOfWeek : null,
      customDate: s.type === 'custom' && s.customDate ? s.customDate : null,
      startTime: s.startTime,
      endTime: s.endTime,
      location: s.location || null,
      notes: s.notes || null,
      maxCapacity: s.maxCapacity || 1,
    }))

    onSubmit({
      title,
      description: description || undefined,
      userId: Number(userId),
      startDate,
      endDate: endDate || null,
      isActive,
      shifts: payloadShifts,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialSchedule ? 'Editar Escala' : 'Nova Escala de Atendimento'}
            </h2>
            <p className="text-xs text-slate-500">
              Configure os dados gerais e os dias e horários customizados
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleFormSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Informações da Escala
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Título da Escala *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Escala de Acolhimento e Plantão 2026.2"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Profissional / Estagiário Escalado *
                  </label>
                  <select
                    value={userId}
                    onChange={(e) => setUserId(Number(e.target.value))}
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="" disabled>
                      Selecione um profissional...
                    </option>
                    {availableUsers
                      .filter((u) => u.role !== 'patient')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.profile?.fullname || u.email} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Escala Ativa
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Data Inicial de Vigência *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Data Final (Opcional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Descrição / Observações Gerais
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Turno destinado a acolhimento de novos alunos e psicoterapia breve..."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Gerenciador de Dias e Horários Customizados */}
            <div className="space-y-4 border-t border-slate-100 pt-5">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    2. Dias e Horários Customizados
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adicione os turnos de atendimento, definindo horários específicos por dia
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddShift()}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Turno
                  </Button>
                </div>
              </div>

              {/* Botões de presets rápidos */}
              <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Atalhos rápidos:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleAddShift({ start: '08:00', end: '12:00', notes: 'Manhã' })
                  }
                  className="rounded border border-slate-200 bg-white px-2 py-1 hover:bg-slate-100"
                >
                  + Manhã (08h - 12h)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAddShift({ start: '13:00', end: '17:00', notes: 'Tarde' })
                  }
                  className="rounded border border-slate-200 bg-white px-2 py-1 hover:bg-slate-100"
                >
                  + Tarde (13h - 17h)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleAddShift({ start: '18:00', end: '22:00', notes: 'Noite' })
                  }
                  className="rounded border border-slate-200 bg-white px-2 py-1 hover:bg-slate-100"
                >
                  + Noite (18h - 22h)
                </button>
              </div>

              {/* Lista de Turnos */}
              <div className="space-y-3">
                {shifts.map((shift, index) => (
                  <div
                    key={shift.key}
                    className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-slate-50"
                  >
                    <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-700">
                        Turno #{index + 1}
                      </span>
                      {shifts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveShift(shift.key)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                          title="Remover horário"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      {/* Tipo de dia: recorrente ou data específica */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Tipo de Dia
                        </label>
                        <select
                          value={shift.type}
                          onChange={(e) =>
                            handleUpdateShift(shift.key, {
                              type: e.target.value as 'recurring' | 'custom',
                            })
                          }
                          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                        >
                          <option value="recurring">Dia da Semana</option>
                          <option value="custom">Data Específica</option>
                        </select>
                      </div>

                      {/* Dia da semana ou data customizada */}
                      <div>
                        {shift.type === 'recurring' ? (
                          <>
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Dia da Semana
                            </label>
                            <select
                              value={shift.dayOfWeek}
                              onChange={(e) =>
                                handleUpdateShift(shift.key, {
                                  dayOfWeek: Number(e.target.value),
                                })
                              }
                              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                            >
                              {DAYS_OF_WEEK.map((d) => (
                                <option key={d.value} value={d.value}>
                                  {d.label}
                                </option>
                              ))}
                            </select>
                          </>
                        ) : (
                          <>
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Data Customizada
                            </label>
                            <input
                              type="date"
                              required
                              value={shift.customDate}
                              onChange={(e) =>
                                handleUpdateShift(shift.key, {
                                  customDate: e.target.value,
                                })
                              }
                              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                            />
                          </>
                        )}
                      </div>

                      {/* Início */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Horário Início *
                        </label>
                        <input
                          type="time"
                          required
                          value={shift.startTime}
                          onChange={(e) =>
                            handleUpdateShift(shift.key, { startTime: e.target.value })
                          }
                          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                        />
                      </div>

                      {/* Fim */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Horário Fim *
                        </label>
                        <input
                          type="time"
                          required
                          value={shift.endTime}
                          onChange={(e) =>
                            handleUpdateShift(shift.key, { endTime: e.target.value })
                          }
                          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                        />
                      </div>

                      {/* Sala / Local */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Sala / Localização
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Sala 02, Ambulatório A"
                          value={shift.location}
                          onChange={(e) =>
                            handleUpdateShift(shift.key, { location: e.target.value })
                          }
                          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                        />
                      </div>

                      {/* Observação do turno */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Observações do Turno
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Triagem, Acolhimento, Supervisão"
                          value={shift.notes}
                          onChange={(e) =>
                            handleUpdateShift(shift.key, { notes: e.target.value })
                          }
                          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Modal */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {initialSchedule ? 'Salvar Alterações' : 'Criar Escala'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
