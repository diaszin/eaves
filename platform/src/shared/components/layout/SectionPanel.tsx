import { useState } from 'react'
import { Search } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/contexts/auth'
import { AppointmentsList } from '@/features/appointments/components/AppointmentsList'
import { JournalsList } from '@/features/journals/components/JournalsList'
import { SchedulesList } from '@/features/schedules/components/SchedulesList'
import { SurveysList } from '@/features/surveys/components/SurveysList'
import { TraineesList } from '@/features/users/components/TraineesList'

function useCurrentSection() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/appointments')) return 'appointments'
  if (pathname.startsWith('/schedules')) return 'schedules'
  if (pathname.startsWith('/trainees')) return 'trainees'
  if (pathname.startsWith('/surveys')) return 'surveys'
  if (pathname.startsWith('/journals')) return 'journals'
  if (pathname.startsWith('/dashboard')) return 'dashboard'
  if (pathname.startsWith('/profile')) return 'profile'
  if (pathname.startsWith('/settings')) return 'settings'
  return null
}

const SECTION_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  appointments: 'Agendamentos',
  schedules: 'Escalas de Atendimento',
  trainees: 'Estagiários',
  surveys: 'Pesquisas',
  journals: 'Diários',
  profile: 'Meu Perfil',
  settings: 'Configuração geral',
}

export function SectionPanel() {
  const section = useCurrentSection()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { user } = useAuth()

  if (
    !section ||
    section === 'dashboard' ||
    section === 'profile' ||
    section === 'settings'
  ) {
    return (
      <aside className="flex h-screen w-[280px] flex-shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-4">
          <h2 className="font-semibold text-slate-800">
            {section ? SECTION_TITLES[section] : ''}
          </h2>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-400">
            {section === 'profile'
              ? 'Edite seu perfil ao lado.'
              : section === 'settings'
                ? 'Configure os padrões da plataforma.'
                : ''}
          </p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="flex h-screen w-[280px] flex-shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-4">
        <h2 className="font-semibold text-slate-800">
          {SECTION_TITLES[section] ?? section}
        </h2>
      </div>

      <div className="border-b border-slate-100 px-3 py-2">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
          <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {section === 'appointments' && (
          <AppointmentsList
            search={search}
            onSelect={(patientId) =>
              navigate(`/appointments/patient/${patientId}`)
            }
          />
        )}
        {section === 'schedules' && (
          <SchedulesList
            search={search}
            onSelect={(id) => navigate(`/schedules/${id}`)}
          />
        )}
        {section === 'trainees' && (
          <TraineesList
            search={search}
            onSelect={(id) => navigate(`/trainees/${id}`)}
            userRole={user?.role}
          />
        )}
        {section === 'surveys' && (
          <SurveysList
            search={search}
            onSelect={(patientId) => navigate(`/surveys/patient/${patientId}`)}
          />
        )}
        {section === 'journals' && (
          <JournalsList
            search={search}
            onSelect={(id) => navigate(`/journals/${id}`)}
          />
        )}
      </div>
    </aside>
  )
}
