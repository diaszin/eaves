import type { Appointment } from '@/features/appointments/services/appointments.service'
import { isDateRangeValid, toLocalDateKey } from '@/shared/utils/dateRange'

export interface PatientAppointmentSummary {
  patientId: number
  displayName: string
  email: string
  appointmentCount: number
  lastAppointmentAt: string
  appointments: Appointment[]
}

export interface PatientAppointmentFilters {
  from: string
  to: string
  professionalId: string
}

export interface ProfessionalOption {
  id: number
  label: string
}

export const EMPTY_FILTERS: PatientAppointmentFilters = {
  from: '',
  to: '',
  professionalId: '',
}

export const NO_PROFESSIONAL_LABEL = 'Profissional não informado'

function startOf(appointment: Appointment): string {
  return appointment.initialDate ?? appointment.date ?? ''
}

function time(appointment: Appointment): number {
  const value = new Date(startOf(appointment)).getTime()
  return Number.isNaN(value) ? 0 : value
}

export function getProfessional(appointment: Appointment) {
  return appointment.professional ?? appointment.therapist
}

export function getProfessionalLabel(appointment: Appointment): string {
  const professional = getProfessional(appointment)
  return (
    professional?.profile?.fullname ?? professional?.email ?? NO_PROFESSIONAL_LABEL
  )
}

export function groupByPatient(
  appointments: Appointment[],
): PatientAppointmentSummary[] {
  const groups = new Map<number, Appointment[]>()
  for (const appointment of appointments) {
    if (!appointment.patient) continue
    const list = groups.get(appointment.patient.id) ?? []
    list.push(appointment)
    groups.set(appointment.patient.id, list)
  }

  return Array.from(groups.entries(), ([patientId, items]) => {
    const sorted = [...items].sort((a, b) => time(b) - time(a))
    const patient = sorted[0].patient!
    return {
      patientId,
      displayName: patient.profile?.fullname ?? patient.email,
      email: patient.email,
      appointmentCount: sorted.length,
      lastAppointmentAt: startOf(sorted[0]),
      appointments: sorted,
    }
  }).sort(
    (a, b) =>
      new Date(b.lastAppointmentAt).getTime() -
      new Date(a.lastAppointmentAt).getTime(),
  )
}

export function searchPatients(
  summaries: PatientAppointmentSummary[],
  query: string,
): PatientAppointmentSummary[] {
  const q = query.trim().toLowerCase()
  if (!q) return summaries
  return summaries.filter(
    (s) =>
      s.displayName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q),
  )
}

export function getProfessionalOptions(
  appointments: Appointment[],
): ProfessionalOption[] {
  const options = new Map<number, ProfessionalOption>()
  for (const appointment of appointments) {
    const professional = getProfessional(appointment)
    if (!professional || options.has(professional.id)) continue
    options.set(professional.id, {
      id: professional.id,
      label: professional.profile?.fullname ?? professional.email,
    })
  }
  return Array.from(options.values()).sort((a, b) =>
    a.label.localeCompare(b.label, 'pt-BR'),
  )
}

export function hasActiveFilters(filters: PatientAppointmentFilters): boolean {
  return !!(filters.from || filters.to || filters.professionalId)
}

export function filterAppointments(
  appointments: Appointment[],
  filters: PatientAppointmentFilters,
): Appointment[] {
  const rangeValid = isDateRangeValid(filters.from, filters.to)
  return appointments.filter((appointment) => {
    if (filters.professionalId) {
      const professional = getProfessional(appointment)
      if (String(professional?.id ?? '') !== filters.professionalId) return false
    }
    if (rangeValid) {
      const day = toLocalDateKey(startOf(appointment))
      if (filters.from && day < filters.from) return false
      if (filters.to && day > filters.to) return false
    }
    return true
  })
}
