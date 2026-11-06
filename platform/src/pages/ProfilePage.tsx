import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Mail, Lock, Save } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { http } from '@/lib/http'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { PlatformRole } from '@/lib/auth'

interface UpdateProfileDto {
  profile?: { fullname?: string }
  email?: string
}

interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [fullname, setFullname] = useState(user?.profile?.fullname ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  const updateProfileMutation = useMutation({
    mutationFn: (dto: UpdateProfileDto) =>
      http.patch(`/users/${user?.id}`, dto).then((r) => r.data),
    onSuccess: () => {
      setProfileSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setTimeout(() => setProfileSuccess(false), 3000)
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: (dto: ChangePasswordDto) =>
      http.post('/auth/change-password', dto).then((r) => r.data),
    onSuccess: () => {
      setPwSuccess(true)
      setPwError(null)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwSuccess(false), 3000)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Erro ao alterar senha.'
      setPwError(Array.isArray(msg) ? msg.join(', ') : String(msg))
    },
  })

  function handleProfileSubmit(e: FormEvent) {
    e.preventDefault()
    updateProfileMutation.mutate({
      email: email !== user?.email ? email : undefined,
      profile: { fullname },
    })
  }

  function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault()
    setPwError(null)
    if (newPassword !== confirmPassword) {
      setPwError('As senhas não coincidem.')
      return
    }
    if (newPassword.length < 6) {
      setPwError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    changePasswordMutation.mutate({ currentPassword, newPassword })
  }

  return (
    <div className="p-8">
      <h1 className="mb-8 text-xl font-semibold text-slate-900">Meu Perfil</h1>

      <div className="max-w-2xl space-y-6">
        {/* Profile card */}
        <div className="flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Avatar name={user?.profile?.fullname} size="lg" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {user?.profile?.fullname ?? user?.email}
            </h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="mt-2">
              {user?.role && (
                <Badge role={user.role as PlatformRole} />
              )}
            </div>
          </div>
        </div>

        {/* Edit profile form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 font-semibold text-slate-800">
            <User className="h-4 w-4 text-indigo-600" />
            Informações Pessoais
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input
              label="Nome completo"
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Seu nome completo"
            />
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />

            {updateProfileMutation.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">
                  Erro ao salvar. Tente novamente.
                </p>
              </div>
            )}

            {profileSuccess && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-700">
                  Perfil atualizado com sucesso!
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={updateProfileMutation.isPending}
              >
                <Save className="h-4 w-4" />
                Salvar alterações
              </Button>
            </div>
          </form>
        </div>

        {/* Change password form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 font-semibold text-slate-800">
            <Lock className="h-4 w-4 text-indigo-600" />
            Alterar Senha
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Senha atual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <Input
              label="Nova senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              helperText="Mínimo de 6 caracteres"
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            {pwError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{pwError}</p>
              </div>
            )}

            {pwSuccess && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-700">
                  Senha alterada com sucesso!
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={changePasswordMutation.isPending}
              >
                <Mail className="h-4 w-4" />
                Alterar senha
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
