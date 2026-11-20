import { http } from '@/shared/http.client'

export interface PHQ9Answer {
  questionIndex: number
  question: string
  score: number
}

export interface Survey {
  id: number
  createdAt: string
  totalScore: number
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe'
  answers: PHQ9Answer[]
  patient: {
    id: number
    email: string
    profile?: { fullname: string }
  }
}

export const surveysService = {
  list: async (): Promise<Survey[]> => {
    return http
      .get<Survey[]>('/survey/phq/daily/responses')
      .then((r) => r.data)
  },

  getById: async (id: number): Promise<Survey> => {
    return http
      .get<Survey>(`/survey/phq/daily/responses/${id}`)
      .then((r) => r.data)
  },
}

export const PHQ9_QUESTIONS = [
  'Pouco interesse ou prazer em fazer as coisas',
  'Se sentindo para baixo, deprimido ou sem perspectiva',
  'Dificuldade para adormecer ou permanecer dormindo, ou dormindo mais do que o habitual',
  'Sentindo-se cansado ou com falta de energia',
  'Pouco apetite ou exagero ao comer',
  'Se sentindo mal consigo mesmo — ou achando que é um fracasso',
  'Dificuldade em se concentrar nas coisas',
  'Se movimentar ou falar muito devagar ou muito agitado',
  'Pensamentos de que seria melhor estar morto ou de se machucar',
]

export const PHQ9_SEVERITY_LABELS: Record<Survey['severity'], string> = {
  minimal: 'Mínima',
  mild: 'Leve',
  moderate: 'Moderada',
  moderately_severe: 'Moderada-Grave',
  severe: 'Grave',
}

export const PHQ9_SEVERITY_COLORS: Record<Survey['severity'], string> = {
  minimal: 'green',
  mild: 'yellow',
  moderate: 'orange',
  moderately_severe: 'red',
  severe: 'red',
}

export const SCORE_LABELS = ['Nunca', 'Vários dias', 'Mais da metade dos dias', 'Quase todo dia']
