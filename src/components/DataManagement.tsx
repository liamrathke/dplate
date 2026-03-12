/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */

import { Download, Upload, X } from 'lucide-react'
import { useRef } from 'react'

interface DataManagementProps {
  onClose: () => void
  onExport: () => string
  onImport: (json: string) => boolean
  seenCount: number
  totalCount: number
}

export function DataManagement({
  onClose,
  onExport,
  onImport,
  seenCount,
  totalCount,
}: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data = onExport()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dplate-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const success = onImport(text)
      if (!success) {
        alert('Invalid data file. Please select a valid DPlate backup.')
      } else {
        alert('Data imported successfully!')
        onClose()
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-card rounded-t-2xl p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-secondary text-muted-foreground"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold mb-1">Data Management</h2>
        <p className="text-sm text-muted-foreground mb-5">
          {seenCount} of {totalCount} codes spotted
        </p>

        {/* Progress bar */}
        <div className="w-full h-2 bg-secondary rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-seen rounded-full transition-all duration-500"
            style={{
              width: `${totalCount > 0 ? (seenCount / totalCount) * 100 : 0}%`,
            }}
          />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleExport}
            className="w-full h-12 rounded-xl bg-secondary text-foreground font-semibold text-sm flex items-center justify-center gap-2 active:bg-secondary/80"
          >
            <Download size={18} />
            Export Backup
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="w-full h-12 rounded-xl bg-secondary text-foreground font-semibold text-sm flex items-center justify-center gap-2 active:bg-secondary/80"
          >
            <Upload size={18} />
            Import Backup
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
