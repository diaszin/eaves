import type { ExportDocument } from './types'

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function sheetName(name: string, index: number): string {
  const clean = name.replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 31)
  return clean || `Planilha ${index + 1}`
}

export async function toXlsxBlob(doc: ExportDocument): Promise<Blob> {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.created = new Date()

  doc.tables.forEach((table, index) => {
    const ws = wb.addWorksheet(sheetName(table.name, index))
    const widths = table.columns.map((c) => c.length)

    const title = ws.addRow([doc.title])
    title.font = { bold: true, size: 14 }
    for (const m of doc.meta) {
      const row = ws.addRow([m.label, m.value])
      row.getCell(1).font = { bold: true }
    }
    ws.addRow([])

    const header = ws.addRow(table.columns)
    header.font = { bold: true }
    header.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } }
      cell.border = { bottom: { style: 'thin' } }
    })

    for (const r of table.rows) {
      ws.addRow(r)
      r.forEach((v, i) => {
        widths[i] = Math.max(widths[i] ?? 0, Math.min(v.length, 60))
      })
    }

    if (doc.summary?.length && index === doc.tables.length - 1) {
      ws.addRow([])
      for (const s of doc.summary) {
        const row = ws.addRow([s.label, s.value])
        row.font = { bold: true }
      }
    }
    ws.addRow([])
    ws.addRow([`Gerado em ${doc.generatedAt}`]).font = { italic: true, color: { argb: 'FF64748B' } }

    widths.forEach((w, i) => {
      ws.getColumn(i + 1).width = Math.max(w + 2, 14)
    })
  })

  const buffer = await wb.xlsx.writeBuffer()
  return new Blob([buffer], { type: XLSX_MIME })
}
