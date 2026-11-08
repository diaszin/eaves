import { http } from '@/lib/http'
import type { PlatformRole } from '@/lib/auth'

export interface User {
  id: number
  email: string
  role: PlatformRole | 'patient'
  isActive?: boolean
  profile?: {
    fullname: string
    emergencyPhone  ?: string
    birthdate?: string
    [key: string]: unknown
  }
  createdAt?: string
  updatedAt?: string
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

export const usersService = {
  list: async (params?: { role?: string; search?: string }): Promise<User[]> => {
    const data = await http.get<User[]>('/employees', { params }).then((r) => r.data)
    if (Array.isArray(data)) {
      return data
    }
    return []
  },

  getById: async (id: number): Promise<User> => {
    return http.get<User>(`/employees/${id}`).then((r) => r.data)
  },

  create: (dto: CreateUserDto) =>
    http.post<User>('/users', dto).then((r) => r.data),

  update: (id: number, dto: UpdateUserDto) =>
    http.patch<User>(`/users/${id}`, dto).then((r) => r.data),

  remove: (id: number) => http.delete(`/users/${id}`).then((r) => r.data),
}
