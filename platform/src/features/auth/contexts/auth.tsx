import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import { http, setToken, setUnauthorizedHandler } from '@/shared/http.client'
import { authService } from '@/features/auth/services/auth.service'

export type PlatformRole = 'lobby' | 'trainee' | 'professor' | 'coordinator'

export interface AuthUser {
  id: number
  email: string
  role: PlatformRole | 'patient'
  profile: {
    fullname: string
    [key: string]: unknown
  }
}

interface DecodedToken {
  sub?: string
  exp?: number
  email?: string
  role?: PlatformRole | 'patient'
  profile?: {
    fullname?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (token: string, expires: number) => Promise<void>
  signOut: () => void
}

const SESSION_KEY = 'platform.session'

const AuthContext = createContext<AuthContextValue | null>(null)

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token)
    if (!decoded.exp) return false
    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const fetchProfile = useCallback(
    async (tokenToUse?: string) => {
      const activeToken = tokenToUse ?? localStorage.getItem(SESSION_KEY)
      if (!activeToken) {
        setUser(null)
        return
      }

      setToken(activeToken)

      try {
        const data = await authService.getProfile()
        if (data) {
          setUser(data as AuthUser)
          return
        }
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status

        // Apenas encerra sessão se for 401 (token inválido/expirado)
        if (status === 401) {
          signOut()
          return
        }

        // Se falhou por outro motivo (ex: rede ou timeout), tenta recuperar do JWT
        try {
          const decoded = jwtDecode<DecodedToken>(activeToken)
          if (decoded.sub) {
            setUser({
              id: Number(decoded.sub),
              email: decoded.email ?? '',
              role: (decoded.role as PlatformRole) ?? 'professor',
              profile: {
                fullname: decoded.profile?.fullname ?? 'Usuário',
              },
            })
            return
          }
        } catch {
          // Token indecodificável
        }

        if (status !== 403) {
          signOut()
        }
      }
    },
    [signOut],
  )

  const signIn = useCallback(
    async (token: string, _expires: number) => {
      localStorage.setItem(SESSION_KEY, token)
      setToken(token)
      await fetchProfile(token)
    },
    [fetchProfile],
  )

  useEffect(() => {
    setUnauthorizedHandler(signOut)
    return () => setUnauthorizedHandler(null)
  }, [signOut])

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored && !isTokenExpired(stored)) {
      setToken(stored)
      fetchProfile(stored).finally(() => setIsLoading(false))
    } else {
      if (stored) localStorage.removeItem(SESSION_KEY)
      setIsLoading(false)
    }
  }, [fetchProfile])

  // Manter instância do axios sempre com o token atual
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) setToken(stored)
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      signIn,
      signOut,
    }),
    [user, isLoading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function hasRole(user: AuthUser | null, roles: PlatformRole[]): boolean {
  if (!user) return false
  return roles.includes(user.role as PlatformRole)
}

export { http }
