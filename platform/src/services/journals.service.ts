import { http } from '@/lib/http'

export interface JournalEntry {
  id: number
  content: string
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible'
  createdAt: string
  updatedAt: string
  patient: {
    id: number
    email: string
    profile?: { fullname: string }
  }
}

// Mock journal entries for development
const MOCK_JOURNALS: JournalEntry[] = [
  {
    id: 1,
    content:
      'Hoje foi um dia difícil. As aulas foram pesadas e eu me senti sobrecarregado com as provas que se aproximam. Tentei estudar, mas a concentração estava baixa. À tarde, conversei com um amigo que me ajudou a me sentir um pouco melhor.',
    mood: 'bad',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    patient: { id: 10, email: 'paciente1@uni.edu', profile: { fullname: 'Lucas Almeida' } },
  },
  {
    id: 2,
    content:
      'Consegui terminar o projeto que estava atrasado. Me sinto mais aliviado agora. Dormiu bem pela primeira vez em semanas.',
    mood: 'good',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    patient: { id: 10, email: 'paciente1@uni.edu', profile: { fullname: 'Lucas Almeida' } },
  },
]

export const MOOD_LABELS: Record<NonNullable<JournalEntry['mood']>, string> = {
  great: 'Ótimo',
  good: 'Bom',
  neutral: 'Neutro',
  bad: 'Ruim',
  terrible: 'Péssimo',
}

export const MOOD_EMOJIS: Record<NonNullable<JournalEntry['mood']>, string> = {
  great: '😄',
  good: '🙂',
  neutral: '😐',
  bad: '😔',
  terrible: '😢',
}

export const journalsService = {
  list: async (params?: { patientId?: number }): Promise<JournalEntry[]> => {
    try {
      return await http.get<JournalEntry[]>('/journals', { params }).then((r) => r.data)
    } catch {
      let journals = MOCK_JOURNALS
      if (params?.patientId) {
        journals = journals.filter((j) => j.patient.id === params.patientId)
      }
      return journals
    }
  },

  getById: async (id: number): Promise<JournalEntry> => {
    try {
      return await http.get<JournalEntry>(`/journals/${id}`).then((r) => r.data)
    } catch {
      const found = MOCK_JOURNALS.find((j) => j.id === id)
      if (found) return found
      throw new Error('Entrada de diário não encontrada')
    }
  },
}
