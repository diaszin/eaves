import { http } from '@/lib/http'

export interface PHQ9Answer {
  questionIndex: number
  question: string
  score: number
}

export interface Survey {
  id: number
  createdAt: string
  updatedAt: string
  totalScore: number
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe'
  answers: PHQ9Answer[]
  patient: {
    id: number
    email: string
    profile?: { fullname: string }
  }
}

function getSeverityLabel(score: number): Survey['severity'] {
  if (score <= 4) return 'minimal'
  if (score <= 9) return 'mild'
  if (score <= 14) return 'moderate'
  if (score <= 19) return 'moderately_severe'
  return 'severe'
}

// Mock surveys for development
const MOCK_SURVEYS: Survey[] = [
  {
    id: 1,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalScore: 12,
    severity: getSeverityLabel(12),
    answers: [
      { questionIndex: 0, question: 'Pouco interesse ou prazer em fazer as coisas', score: 1 },
      { questionIndex: 1, question: 'Se sentindo para baixo, deprimido ou sem perspectiva', score: 2 },
      { questionIndex: 2, question: 'Dificuldade para adormecer ou permanecer dormindo, ou dormindo mais do que o habitual', score: 2 },
      { questionIndex: 3, question: 'Sentindo-se cansado ou com falta de energia', score: 2 },
      { questionIndex: 4, question: 'Pouco apetite ou exagero ao comer', score: 1 },
      { questionIndex: 5, question: 'Se sentindo mal consigo mesmo — ou achando que é um fracasso, que decepcionou sua família ou a você mesmo', score: 1 },
      { questionIndex: 6, question: 'Dificuldade em se concentrar nas coisas', score: 1 },
      { questionIndex: 7, question: 'Se movimentar ou falar tão devagar que outras pessoas notaram, ou ao contrário, estar tão agitado que ficou andando de um lado para o outro', score: 1 },
      { questionIndex: 8, question: 'Pensamentos de que seria melhor estar morto ou de se machucar', score: 1 },
    ],
    patient: { id: 10, email: 'paciente1@uni.edu', profile: { fullname: 'Lucas Almeida' } },
  },
]

export const surveysService = {
  list: async (params?: { patientId?: number }): Promise<Survey[]> => {
    try {
      return await http.get<Survey[]>('/surveys', { params }).then((r) => r.data)
    } catch {
      let surveys = MOCK_SURVEYS
      if (params?.patientId) {
        surveys = surveys.filter((s) => s.patient.id === params.patientId)
      }
      return surveys
    }
  },

  getById: async (id: number): Promise<Survey> => {
    try {
      return await http.get<Survey>(`/surveys/${id}`).then((r) => r.data)
    } catch {
      const found = MOCK_SURVEYS.find((s) => s.id === id)
      if (found) return found
      throw new Error('Questionário não encontrado')
    }
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
