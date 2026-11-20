import {
  PHQ9_QUESTIONS,
  PHQ9_SEVERITY_LABELS,
  SCORE_LABELS,
  type Survey,
} from '@/features/surveys/services/surveys.service'
import { buildFileName } from '@/shared/utils/export/download'
import type { ExportDocument } from '@/shared/utils/export/types'

export function buildSurveyExport(survey: Survey): ExportDocument {
  const patient = survey.patient.profile?.fullname ?? survey.patient.email
  const answered = new Date(survey.createdAt)

  const rows = PHQ9_QUESTIONS.map((question, idx) => {
    const answer = survey.answers?.find((a) => a.questionIndex === idx)
    return [
      String(idx + 1),
      question,
      answer ? String(answer.score) : '—',
      answer ? (SCORE_LABELS[answer.score] ?? '—') : 'Sem resposta',
    ]
  })

  return {
    title: 'Questionário PHQ-9',
    fileBaseName: buildFileName('pesquisa-phq9', patient, '').slice(0, -1),
    meta: [
      { label: 'Paciente', value: patient },
      {
        label: 'Data da resposta',
        value: Number.isNaN(answered.getTime())
          ? survey.createdAt
          : answered.toLocaleDateString('pt-BR'),
      },
    ],
    tables: [{ name: 'Respostas', columns: ['Nº', 'Pergunta', 'Pontuação', 'Resposta'], rows }],
    summary: [
      { label: 'Pontuação total', value: `${survey.totalScore} de 27` },
      { label: 'Gravidade', value: PHQ9_SEVERITY_LABELS[survey.severity] },
    ],
    generatedAt: new Date().toLocaleString('pt-BR'),
  }
}
