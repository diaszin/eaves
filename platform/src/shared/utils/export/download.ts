import type { ExportDocument, ExportFormat } from './types'

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildFileName(prefix: string, personName: string, ext: string): string {
  const date = new Date().toISOString().slice(0, 10)
  const person = slugify(personName) || 'sem-nome'
  return `${prefix}-${person}-${date}.${ext}`
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Gera o arquivo no formato pedido (bibliotecas carregadas sob demanda) e inicia o download. */
export async function exportDocument(doc: ExportDocument, format: ExportFormat): Promise<void> {
  const blob =
    format === 'xlsx'
      ? await (await import('./toXlsx')).toXlsxBlob(doc)
      : await (await import('./toPdf')).toPdfBlob(doc)
  downloadBlob(blob, `${doc.fileBaseName}.${format}`)
}
