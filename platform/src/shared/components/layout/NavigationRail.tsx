import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  Users,
  ClipboardList,
  LogOut,
  User,
  Settings,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth, type PlatformRole } from '@/features/auth/contexts/auth'
import { Avatar } from '@/shared/components/ui/Avatar'

interface NavItem {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  roles: PlatformRole[]
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['coordinator', 'professor', 'lobby', 'trainee'],
  },
  {
    key: 'appointments',
    label: 'Agendamentos',
    icon: CalendarDays,
    path: '/appointments',
    roles: ['coordinator', 'professor', 'lobby', 'trainee'],
  },
  {
    key: 'schedules',
    label: 'Escalas',
    icon: CalendarRange,
    path: '/schedules',
    roles: ['coordinator', 'professor', 'lobby', 'trainee'],
  },
  {
    key: 'trainees',
    label: 'Estagiários',
    icon: Users,
    path: '/trainees',
    roles: ['coordinator', 'lobby'],
  },
  {
    key: 'surveys',
    label: 'Questionários',
    icon: ClipboardList,
    path: '/surveys',
    roles: ['coordinator', 'professor'],
  },
  {
    key: 'settings',
    label: 'Configurações',
    icon: Settings,
    path: '/settings',
    roles: ['coordinator'],
  },
]

export function NavigationRail() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      user?.role &&
      user.role !== 'patient' &&
      item.roles.includes(user.role as PlatformRole),
  )

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <nav
      className="flex h-screen w-16 flex-shrink-0 flex-col items-center bg-slate-900 py-3"
      aria-label="Navegação principal"
    >
      {/* Logo */}
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white text-lg select-none">
        E
      </div>

      {/* Nav items */}
      <div className="flex flex-1 flex-col items-center gap-1 pt-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            title={item.label}
            className={({ isActive }) =>
              clsx(
                'group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={clsx('h-5 w-5', isActive ? 'text-white' : '')} />
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom: profile + logout */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <NavLink
          to="/profile"
          title="Meu Perfil"
          className={({ isActive }) =>
            clsx(
              'group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
              isActive
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-700 hover:text-white',
            )
          }
        >
          {user?.profile?.fullname ? (
            <Avatar name={user.profile.fullname} size="sm" />
          ) : (
            <User className="h-5 w-5" />
          )}
          <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Meu Perfil
          </span>
        </NavLink>

        <button
          onClick={handleSignOut}
          title="Sair"
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-900 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" />
          <span className="pointer-events-none absolute left-14 z-50 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Sair
          </span>
        </button>
      </div>
    </nav>
  )
}
