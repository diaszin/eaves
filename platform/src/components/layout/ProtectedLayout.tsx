import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { LogOut } from 'lucide-react'
import { ThreePaneLayout } from './ThreePaneLayout'

export function ProtectedLayout() {
  const { isAuthenticated, isLoading, user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    signOut()
    navigate('/login', { replace: true })
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-500">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role === 'patient') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-sm max-w-md">
          <div className="mb-3 text-4xl">🚫</div>
          <h1 className="text-lg font-semibold text-red-700">Acesso Negado</h1>
          <p className="mt-2 text-sm text-red-600">
            Sua conta de paciente não tem acesso à plataforma de gestão. Por
            favor, utilize o aplicativo Eaves.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="border-red-300 bg-white text-red-700 hover:bg-red-100 focus:ring-red-400"
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ThreePaneLayout>
      <Outlet />
    </ThreePaneLayout>
  )
}
