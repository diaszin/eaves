import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, Mail, Shield, Phone, Calendar } from 'lucide-react'
import { usersService } from '@/services/users.service'
import { Badge, ROLE_LABELS } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import type { PlatformRole } from '@/lib/auth'

type FilterRole = 'all' | PlatformRole | 'patient'

const FILTER_OPTIONS: { label: string; value: FilterRole }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Coordenadores', value: 'coordinator' },
  { label: 'Professores', value: 'professor' },
  { label: 'Recepcionistas', value: 'lobby' },
  { label: 'Estagiários', value: 'trainee' },
]

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  } catch {
    return dateStr
  }
}

export default function UsersPage() {
  const { id } = useParams<{ id?: string }>()
  const [filter, setFilter] = useState<FilterRole>('all')

  const detailQ = useQuery({
    queryKey: ['users', id],
    queryFn: () => usersService.getById(Number(id)),
    enabled: !!id,
  })

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-slate-100 px-8 py-5">
        <h1 className="text-xl font-semibold text-slate-900">Usuários</h1>

        {/* Filter tabs */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        {id ? (
          detailQ.isLoading ? (
            <LoadingSpinner centered />
          ) : detailQ.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
              Erro ao carregar usuário.
            </div>
          ) : detailQ.data ? (
            <UserDetail user={detailQ.data} />
          ) : null
        ) : (
          <EmptyState
            title="Selecione um usuário"
            description="Escolha um usuário na lista à esquerda para ver os detalhes."
            icon={<Users className="h-7 w-7" />}
          />
        )}
      </div>
    </div>
  )
}

function UserDetail({
  user,
}: {
  user: Awaited<ReturnType<typeof usersService.getById>>
}) {
  return (
    <div className="max-w-2xl">
      {/* Profile header */}
      <div className="mb-6 flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Avatar name={user.profile?.fullname} size="lg" />
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900">
            {user.profile?.fullname ?? '—'}
          </h2>
          <p className="text-sm text-slate-500">{user.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge role={user.role as PlatformRole | 'patient'} />
            {user.isActive ? (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Ativo
              </span>
            ) : (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                Inativo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info fields */}
      <div className="grid grid-cols-2 gap-4">
        <InfoCard
          icon={<Mail className="h-4 w-4" />}
          label="E-mail"
          value={user.email}
        />
        <InfoCard
          icon={<Shield className="h-4 w-4" />}
          label="Função"
          value={ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] ?? user.role}
        />
        <InfoCard
          icon={<Phone className="h-4 w-4" />}
          label="Telefone"
          value={user.profile?.phone ?? '—'}
        />
        <InfoCard
          icon={<Calendar className="h-4 w-4" />}
          label="Membro desde"
          value={formatDate(user.createdAt)}
        />
      </div>
    </div>
  )
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </div>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}
