import { useState } from 'react'
import { FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import type { ExportFormat } from '@/shared/utils/export/types'

interface ExportMenuProps {
  onExport: (format: ExportFormat) => Promise<void>
  disabled?: boolean
}

export function ExportMenu({ onExport, disabled }: ExportMenuProps) {
  const [running, setRunning] = useState<ExportFormat | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (format: ExportFormat) => {
    setError(null)
    setRunning(format)
    try {
      await onExport(format)
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : 'Não foi possível gerar o arquivo. Tente novamente.',
      )
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled || running !== null}
          isLoading={running === 'xlsx'}
          onClick={() => run('xlsx')}
        >
          {running !== 'xlsx' && <FileSpreadsheet className="h-4 w-4" />}
          Exportar Excel
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={disabled || running !== null}
          isLoading={running === 'pdf'}
          onClick={() => run('pdf')}
        >
          {running !== 'pdf' && <FileText className="h-4 w-4" />}
          Exportar PDF
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
