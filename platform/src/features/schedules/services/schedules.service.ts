import { http } from '@/shared/http.client'

export interface ScheduleShift {
  id?: number
  dayOfWeek?: number | null // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
  customDate?: string | null // YYYY-MM-DD para dias específicos
  startTime: string // HH:mm (ex: '08:00')
  endTime: string // HH:mm (ex: '12:00')
  location?: string | null // ex: 'Sala 01', 'Ambulatório de Psicologia'
  notes?: string | null
  maxCapacity?: number
}

export interface Schedule {
  id: number
  title: string
  description?: string | null
  startDate: string
  endDate?: string | null
  isActive: boolean
  user: {
    id: number
    email: string
    role?: string
    profile?: {
      fullname: string
    }
  }
  createdBy?: {
    id: number
    email: string
    profile?: {
      fullname: string
    }
  }
  shifts: ScheduleShift[]
  created?: string
  updated?: string
}

export interface CreateScheduleDto {
  title: string
  description?: string
  userId: number
  startDate: string
  endDate?: string | null
  isActive?: boolean
  shifts?: ScheduleShift[]
}

export interface UpdateScheduleDto {
  title?: string
  description?: string
  userId?: number
  startDate?: string
  endDate?: string | null
  isActive?: boolean
  shifts?: ScheduleShift[]
}

export const schedulesService = {
  list: async (params?: { userId?: number; isActive?: boolean }): Promise<Schedule[]> => {
    const data = await http.get<Schedule[]>('/schedules', { params }).then((r) => r.data)
    if (Array.isArray(data)) {
      return data
    }
    return []
  },

  getById: async (id: number): Promise<Schedule> => {
    return http.get<Schedule>(`/schedules/${id}`).then((r) => r.data)
  },

  create: async (dto: CreateScheduleDto): Promise<Schedule> => {
    return http.post<Schedule>('/schedules', dto).then((r) => r.data)
  },

  update: async (id: number, dto: UpdateScheduleDto): Promise<Schedule> => {
    return http.patch<Schedule>(`/schedules/${id}`, dto).then((r) => r.data)
  },

  remove: async (id: number): Promise<{ success: boolean }> => {
    return http.delete<{ success: boolean }>(`/schedules/${id}`).then((r) => r.data)
  },

  getSlots: async (userId: number, date: string): Promise<ScheduleShift[]> => {
    const data = await http
      .get<ScheduleShift[]>(`/schedules/user/${userId}/slots`, { params: { date } })
      .then((r) => r.data)

    if (Array.isArray(data)) {
      return data
    }
    return []
  },
}
