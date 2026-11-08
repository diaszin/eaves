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
    const data = await http
      .get<JournalEntry[]>('/journals', { params })
      .then((r) => r.data)

    if (Array.isArray(data)) {
      return data
    }
    return []
  },

  getById: async (id: number): Promise<JournalEntry> => {
    return http.get<JournalEntry>(`/journals/${id}`).then((r) => r.data)
  },
}
