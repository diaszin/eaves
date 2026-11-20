export interface ExportPair {
  label: string
  value: string
}

export interface ExportTable {
  name: string
  columns: string[]
  rows: string[][]
}

export interface ExportDocument {
  title: string
  fileBaseName: string
  meta: ExportPair[]
  tables: ExportTable[]
  summary?: ExportPair[]
  generatedAt: string
}

export type ExportFormat = 'xlsx' | 'pdf'
