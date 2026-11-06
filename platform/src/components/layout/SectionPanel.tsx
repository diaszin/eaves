import { useLocation, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { useAuth } from '@/lib/auth'
import { appointmentsService } from '@/services/appointments.service'
import { usersService } from '@/services/users.service'
import { surveysService } from '@/services/surveys.service'
import { journalsService } from '@/services/journals.service'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  } catch {
    return dateStr
  }
}

function useCurrentSection() {
  const location = useLocation()
  const path = location.pathname
  if (path.startsWith('/appointments')) return 'appointments'
  if (path.startsWith('/users')) return 'users'
  if (path.startsWith('/surveys')) return 'surveys'
  if (path.startsWith('/journals')) return 'journals'
  if (path.startsWith('/dashboard')) return 'dashboard'
  if (path.startsWith('/profile')) return 'profile'
  return null
}

const SECTION_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  appointments: 'Agendamentos',
  users: 'Usuários',
  surveys: 'Questionários PHQ-9',
  journals: 'Diários',
  profile: 'Meu Perfil',
}

export function SectionPanel() {
  const section = useCurrentSection()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { user } = useAuth()

  // Appointments query
  const appointmentsQ = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentsService.list(),
    enabled: section === 'appointments',
  })

  // Users query
  const usersQ = useQuery({
    queryKey: ['users'],
    queryFn: () => usersService.list(),
    enabled: section === 'users',
  })

  // Surveys query
  const surveysQ = useQuery({
    queryKey: ['surveys'],
    queryFn: () => surveysService.list(),
    enabled: section === 'surveys',
  })

  // Journals query
  const journalsQ = useQuery({
    queryKey: ['journals'],
    queryFn: () => journalsService.list(),
    enabled: section === 'journals',
  })

  if (!section || section === 'dashboard' || section === 'profile') {
    return (
      <aside className="flex h-screen w-[280px] flex-shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-4">
          <h2 className="font-semibold text-slate-800">
            {section ? SECTION_TITLES[section] : ''}
          </h2>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-400">
            {section === 'profile' ? 'Edite seu perfil ao lado.' : ''}
          </p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="flex h-screen w-[280px] flex-shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 px-4 py-4">
        <h2 className="font-semibold text-slate-800">
          {SECTION_TITLES[section] ?? section}
        </h2>
      </div>

      {/* Search */}
      <div className="border-b border-slate-100 px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
          <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {section === 'appointments' && (
          <AppointmentsList
            isLoading={appointmentsQ.isLoading}
            items={appointmentsQ.data ?? []}
            search={search}
            onSelect={(id) => navigate(`/appointments/${id}`)}
          />
        )}
        {section === 'users' && (
          <UsersList
            isLoading={usersQ.isLoading}
            items={usersQ.data ?? []}
            search={search}
            onSelect={(id) => navigate(`/users/${id}`)}
            userRole={user?.role}
          />
        )}
        {section === 'surveys' && (
          <SurveysList
            isLoading={surveysQ.isLoading}
            items={surveysQ.data ?? []}
            search={search}
            onSelect={(id) => navigate(`/surveys/${id}`)}
          />
        )}
        {section === 'journals' && (
          <JournalsList
            isLoading={journalsQ.isLoading}
            items={journalsQ.data ?? []}
            search={search}
            onSelect={(id) => navigate(`/journals/${id}`)}
          />
        )}
      </div>
    </aside>
  )
}

// ----- Sub-lists -----

function AppointmentsList({
  isLoading,
  items,
  search,
  onSelect,
}: {
  isLoading: boolean
  items: Awaited<ReturnType<typeof appointmentsService.list>>
  search: string
  onSelect: (id: number) => void
}) {
  const location = useLocation()
  const q = search.toLowerCase()
  const filtered = items.filter((a) => {
    const name = a.patient?.profile?.fullname ?? a.patient?.email ?? ''
    return name.toLowerCase().includes(q) || a.status.toLowerCase().includes(q)
  })

  const STATUS_LABELS: Record<string, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    no_show: 'Ausente',
  }

  if (isLoading) return <LoadingSpinner centered />

  return (
    <ul>
      {filtered.map((a) => {
        const isActive = location.pathname === `/appointments/${a.id}`
        return (
          <li key={a.id}>
            <button
              onClick={() => onSelect(a.id)}
              className={clsx(
                'w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 border-b border-slate-50',
                isActive && 'bg-indigo-50 border-l-2 border-l-indigo-600',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-800 truncate">
                  {a.patient?.profile?.fullname ?? a.patient?.email ?? `#${a.id}`}
                </span>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {formatDate(a.date)}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {STATUS_LABELS[a.status] ?? a.status}
              </div>
            </button>
          </li>
        )
      })}
      {filtered.length === 0 && (
        <li className="py-10 text-center text-sm text-slate-400">
          Nenhum agendamento encontrado
        </li>
      )}
    </ul>
  )
}

function UsersList({
  isLoading,
  items,
  search,
  onSelect,
  userRole,
}: {
  isLoading: boolean
  items: Awaited<ReturnType<typeof usersService.list>>
  search: string
  onSelect: (id: number) => void
  userRole?: string
}) {
  const location = useLocation()
  const q = search.toLowerCase()
  const filtered = items.filter((u) => {
    const name = u.profile?.fullname ?? ''
    return (
      name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  })

  if (isLoading) return <LoadingSpinner centered />

  // For lobby role, exclude coordinators from list
  const visible = userRole === 'lobby'
    ? filtered.filter((u) => u.role !== 'coordinator')
    : filtered

  return (
    <ul>
      {visible.map((u) => {
        const isActive = location.pathname === `/users/${u.id}`
        return (
          <li key={u.id}>
            <button
              onClick={() => onSelect(u.id)}
              className={clsx(
                'w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 border-b border-slate-50',
                isActive && 'bg-indigo-50 border-l-2 border-l-indigo-600',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-800 truncate">
                  {u.profile?.fullname ?? u.email}
                </span>
                <Badge role={u.role as 'coordinator' | 'professor' | 'lobby' | 'trainee' | 'patient'} />
              </div>
              <div className="mt-0.5 text-xs text-slate-500 truncate">{u.email}</div>
            </button>
          </li>
        )
      })}
      {visible.length === 0 && (
        <li className="py-10 text-center text-sm text-slate-400">
          Nenhum usuário encontrado
        </li>
      )}
    </ul>
  )
}

function SurveysList({
  isLoading,
  items,
  search,
  onSelect,
}: {
  isLoading: boolean
  items: Awaited<ReturnType<typeof surveysService.list>>
  search: string
  onSelect: (id: number) => void
}) {
  const location = useLocation()
  const q = search.toLowerCase()
  const filtered = items.filter((s) => {
    const name = s.patient?.profile?.fullname ?? s.patient?.email ?? ''
    return name.toLowerCase().includes(q)
  })

  if (isLoading) return <LoadingSpinner centered />

  return (
    <ul>
      {filtered.map((s) => {
        const isActive = location.pathname === `/surveys/${s.id}`
        return (
          <li key={s.id}>
            <button
              onClick={() => onSelect(s.id)}
              className={clsx(
                'w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 border-b border-slate-50',
                isActive && 'bg-indigo-50 border-l-2 border-l-indigo-600',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-800 truncate">
                  {s.patient?.profile?.fullname ?? s.patient?.email ?? `Paciente #${s.patient?.id}`}
                </span>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  {s.totalScore}pts
                </span>
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                {formatDate(s.createdAt)}
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

function JournalsList({
  isLoading,
  items,
  search,
  onSelect,
}: {
  isLoading: boolean
  items: Awaited<ReturnType<typeof journalsService.list>>
  search: string
  onSelect: (id: number) => void
}) {
  const location = useLocation()
  const q = search.toLowerCase()
  const filtered = items.filter((j) => {
    const name = j.patient?.profile?.fullname ?? j.patient?.email ?? ''
    return name.toLowerCase().includes(q) || j.content.toLowerCase().includes(q)
  })

  if (isLoading) return <LoadingSpinner centered />

  return (
    <ul>
      {filtered.map((j) => {
        const isActive = location.pathname === `/journals/${j.id}`
        return (
          <li key={j.id}>
            <button
              onClick={() => onSelect(j.id)}
              className={clsx(
                'w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 border-b border-slate-50',
                isActive && 'bg-indigo-50 border-l-2 border-l-indigo-600',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-800 truncate">
                  {j.patient?.profile?.fullname ?? j.patient?.email}
                </span>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {formatDate(j.createdAt)}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-slate-500 truncate">
                {j.content.substring(0, 60)}...
              </div>
            </button>
          </li>
        )
      })}
      {filtered.length === 0 && (
        <li className="py-10 text-center text-sm text-slate-400">
          Nenhuma entrada encontrada
        </li>
      )}
    </ul>
  )
}
