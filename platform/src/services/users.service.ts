import { http } from '@/lib/http'
import type { PlatformRole } from '@/lib/auth'

export interface User {
  id: number
  email: string
  role: PlatformRole | 'patient'
  isActive: boolean
  profile?: {
    fullname: string
    phone?: string
    birthdate?: string
    [key: string]: unknown
  }
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  email: string
  password: string
  role: PlatformRole | 'patient'
  profile?: {
    fullname: string
    phone?: string
    birthdate?: string
  }
}

export interface UpdateUserDto {
  email?: string
  role?: PlatformRole | 'patient'
  isActive?: boolean
  profile?: {
    fullname?: string
    phone?: string
    birthdate?: string
  }
}

// Mock users for development when endpoint is not available
const MOCK_USERS: User[] = [
  {
    id: 1,
    email: 'coordenador@eaves.app',
    role: 'coordinator',
    isActive: true,
    profile: { fullname: 'Ana Coordenadora' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    email: 'professor@eaves.app',
    role: 'professor',
    isActive: true,
    profile: { fullname: 'Carlos Professor' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    email: 'recepcao@eaves.app',
    role: 'lobby',
    isActive: true,
    profile: { fullname: 'Maria Recepcionista' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    email: 'estagiario@eaves.app',
    role: 'trainee',
    isActive: true,
    profile: { fullname: 'João Estagiário' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const usersService = {
  list: async (params?: { role?: string; search?: string }): Promise<User[]> => {
    try {
      const data = await http.get<User[]>('/users', { params }).then((r) => r.data)
      return data
    } catch {
      // fallback to mock data if endpoint not available
      let users = MOCK_USERS
      if (params?.role) {
        users = users.filter((u) => u.role === params.role)
      }
      if (params?.search) {
        const q = params.search.toLowerCase()
        users = users.filter(
          (u) =>
            u.email.toLowerCase().includes(q) ||
            u.profile?.fullname.toLowerCase().includes(q),
        )
      }
      return users
    }
  },

  getById: async (id: number): Promise<User> => {
    try {
      return await http.get<User>(`/users/${id}`).then((r) => r.data)
    } catch {
      const found = MOCK_USERS.find((u) => u.id === id)
      if (found) return found
      throw new Error('Usuário não encontrado')
    }
  },

  create: (dto: CreateUserDto) =>
    http.post<User>('/users', dto).then((r) => r.data),

  update: (id: number, dto: UpdateUserDto) =>
    http.patch<User>(`/users/${id}`, dto).then((r) => r.data),

  remove: (id: number) => http.delete(`/users/${id}`).then((r) => r.data),
}
