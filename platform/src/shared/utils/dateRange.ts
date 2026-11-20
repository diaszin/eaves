/** Data local (YYYY-MM-DD) de um timestamp ISO. */
export function toLocalDateKey(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Intervalo válido quando alguma ponta está vazia ou from <= to. */
export function isDateRangeValid(from: string, to: string): boolean {
  return !from || !to || from <= to
}
