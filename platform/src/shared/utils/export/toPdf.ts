import type { ExportDocument } from './types'

export async function toPdfBlob(doc: ExportDocument): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 40
  let y = margin

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  pdf.text(doc.title, margin, y)
  y += 22

  pdf.setFontSize(10)
  for (const m of doc.meta) {
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${m.label}:`, margin, y)
    pdf.setFont('helvetica', 'normal')
    pdf.text(m.value, margin + 110, y, { maxWidth: 595 - margin * 2 - 110 })
    y += 14
  }
  y += 6

  doc.tables.forEach((table, i) => {
    if (doc.tables.length > 1) {
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(11)
      pdf.text(table.name, margin, y)
      y += 6
    }
    autoTable(pdf, {
      startY: y,
      head: [table.columns],
      body: table.rows,
      margin: { left: margin, right: margin },
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [79, 70, 229] },
    })
    y = (pdf as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16
    if (i === doc.tables.length - 1 && doc.summary?.length) {
      pdf.setFontSize(11)
      for (const s of doc.summary) {
        if (y > 800) {
          pdf.addPage()
          y = margin
        }
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${s.label}:`, margin, y)
        pdf.setFont('helvetica', 'normal')
        pdf.text(s.value, margin + 110, y)
        y += 16
      }
    }
  })

  const pages = pdf.getNumberOfPages()
  pdf.setFont('helvetica', 'italic')
  pdf.setFontSize(8)
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p)
    pdf.text(`Gerado em ${doc.generatedAt} — página ${p} de ${pages}`, margin, 825)
  }

  return pdf.output('blob')
}
