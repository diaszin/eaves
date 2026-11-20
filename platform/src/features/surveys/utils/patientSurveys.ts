import type { Survey } from '@/features/surveys/services/surveys.service'

export interface PatientSurveySummary {
  patientId: number
  displayName: string
  email: string
  responseCount: number
  lastResponseAt: string
  surveys: Survey[]
}

export interface PatientSurveyFilters {
  from: string
  to: string
  category: string
}

export const EMPTY_FILTERS: PatientSurveyFilters = {
  from: '',
  to: '',
  category: '',
}

/** Data local (YYYY-MM-DD) de um timestamp ISO. */
export function toLocalDateKey(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function byCreatedAtDesc(a: Survey, b: Survey) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

export function groupByPatient(surveys: Survey[]): PatientSurveySummary[] {
  const groups = new Map<number, Survey[]>()
  for (const survey of surveys) {
    if (!survey.patient) continue
    const list = groups.get(survey.patient.id) ?? []
    list.push(survey)
    groups.set(survey.patient.id, list)
  }

  return Array.from(groups.entries(), ([patientId, items]) => {
    const sorted = [...items].sort(byCreatedAtDesc)
    const patient = sorted[0].patient
    return {
      patientId,
      displayName: patient.profile?.fullname ?? patient.email,
      email: patient.email,
      responseCount: sorted.length,
      lastResponseAt: sorted[0].createdAt,
      surveys: sorted,
    }
  }).sort(
    (a, b) =>
      new Date(b.lastResponseAt).getTime() -
      new Date(a.lastResponseAt).getTime(),
  )
}

export function searchPatients(
  summaries: PatientSurveySummary[],
  query: string,
): PatientSurveySummary[] {
  const q = query.trim().toLowerCase()
  if (!q) return summaries
  return summaries.filter(
    (s) =>
      s.displayName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q),
  )
}

export function getAvailableCategories(surveys: Survey[]): string[] {
  return Array.from(new Set(surveys.map((s) => s.category))).sort()
}

export function isDateRangeValid(from: string, to: string): boolean {
  return !from || !to || from <= to
}

export function hasActiveFilters(filters: PatientSurveyFilters): boolean {
  return !!(filters.from || filters.to || filters.category)
}

export function filterSurveys(
  surveys: Survey[],
  filters: PatientSurveyFilters,
): Survey[] {
  const rangeValid = isDateRangeValid(filters.from, filters.to)
  return surveys.filter((survey) => {
    if (filters.category && survey.category !== filters.category) return false
    if (rangeValid) {
      const day = toLocalDateKey(survey.createdAt)
      if (filters.from && day < filters.from) return false
      if (filters.to && day > filters.to) return false
    }
    return true
  })
}
