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

// Mock inicial para exibição quando não houver registros ou a API estiver em transição
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    date: new Date().toISOString(),
    time: '14:00',
    status: 'scheduled',
    notes: 'Primeira consulta de acolhimento',
    patient: {
      id: 10,
      email: 'aluno1@universidade.edu.br',
      profile: { fullname: 'Lucas Gabriel' },
    },
    therapist: {
      id: 2,
      email: 'professor@eaves.app',
      profile: { fullname: 'Dr. Roberto Santos' },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    date: new Date().toISOString(),
    time: '15:30',
    status: 'confirmed',
    notes: 'Sessão de acompanhamento psicológico',
    patient: {
      id: 11,
      email: 'aluna2@universidade.edu.br',
      profile: { fullname: 'Beatriz Lima' },
    },
    therapist: {
      id: 2,
      email: 'professor@eaves.app',
      profile: { fullname: 'Dr. Roberto Santos' },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const appointmentsService = {
  list: async (
    params?: Record<string, string | number | undefined>,
  ): Promise<Appointment[]> => {
    try {
      const data = await http
        .get<Appointment[]>('/appointments', { params })
        .then((r) => r.data)

      if (Array.isArray(data)) {
        return data
      }
      return []
    } catch {
      // Fallback gracioso para visualização sem quebrar o dashboard
      return MOCK_APPOINTMENTS
    }
  },

  getById: async (id: number): Promise<Appointment> => {
    try {
      return await http.get<Appointment>(`/appointments/${id}`).then((r) => r.data)
    } catch {
      const found = MOCK_APPOINTMENTS.find((a) => a.id === id)
      if (found) return found
      throw new Error('Agendamento não encontrado')
    }
  },

  create: (dto: CreateAppointmentDto) =>
    http.post<Appointment>('/appointments', dto).then((r) => r.data),

  update: (id: number, dto: UpdateAppointmentDto) =>
    http
      .patch<Appointment>(`/appointments/${id}`, dto)
      .then((r) => r.data),

  cancel: (id: number) =>
    http
      .patch<Appointment>(`/appointments/${id}`, { status: 'cancelled' })
      .then((r) => r.data),

  remove: (id: number) => http.delete(`/appointments/${id}`).then((r) => r.data),
}
