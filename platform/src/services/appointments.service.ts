import { http } from '@/lib/http'

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface Appointment {
  id: number
  date: string
  time: string
  status: AppointmentStatus
  notes?: string
  patient?: {
    id: number
    email: string
    profile?: { fullname: string }
  }
  therapist?: {
    id: number
    email: string
    profile?: { fullname: string }
  }
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentDto {
  date: string
  time: string
  patientId: number
  therapistId?: number
  notes?: string
}

export interface UpdateAppointmentDto {
  date?: string
  time?: string
  status?: AppointmentStatus
  notes?: string
}

export const appointmentsService = {
  list: async (
    params?: Record<string, string | number | undefined>,
  ): Promise<Appointment[]> => {
    const data = await http
      .get<Appointment[]>('/appointments', { params })
      .then((r) => r.data)

    if (Array.isArray(data)) {
      return data
    }
    return []
  },

  getById: async (id: number): Promise<Appointment> => {
    return http.get<Appointment>(`/appointments/${id}`).then((r) => r.data)
  },

  create: (dto: CreateAppointmentDto) =>
    http.post<Appointment>('/appointments', dto).then((r) => r.data),

  update: (id: number, dto: UpdateAppointmentDto) =>
    http.patch<Appointment>(`/appointments/${id}`, dto).then((r) => r.data),

  cancel: (id: number) =>
    http
      .patch<Appointment>(`/appointments/${id}`, { status: 'cancelled' })
      .then((r) => r.data),

  remove: (id: number) => http.delete(`/appointments/${id}`).then((r) => r.data),
}
