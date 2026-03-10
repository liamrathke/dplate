import { useState, useEffect } from 'react'
import type { MissionEntry, Sighting } from '../types'
import { cn } from '../lib/utils'
import { X, Share2, Check, Trash2 } from 'lucide-react'

interface PlateDetailProps {
  entry: MissionEntry
  sighting: Sighting | null
  onClose: () => void
  onMarkSeen: (code: string, sighting: Sighting) => void
  onMarkUnseen: (code: string) => void
}

export function PlateDetail({
  entry,
  sighting,
  onClose,
  onMarkSeen,
  onMarkUnseen,
}: PlateDetailProps) {
  const [date, setDate] = useState(
    sighting?.date || new Date().toISOString().split('T')[0]
  )
  const [plate, setPlate] = useState(sighting?.plate || '')
  const isSeen = sighting !== null

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleSave = () => {
    onMarkSeen(entry.code, { date, plate })
    onClose()
  }

  const handleRemove = () => {
    onMarkUnseen(entry.code)
    onClose()
  }

  const handleShare = async () => {
    const text = `🚗 Spotted a diplomatic plate! ${entry.emoji} ${entry.code} — ${entry.mission}${plate ? ` (${plate})` : ''}`
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        // User cancelled share
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-lg bg-card rounded-t-2xl p-5 pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-secondary text-muted-foreground"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-4xl">{entry.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-mono">
                {entry.code}
              </span>
              {isSeen && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-seen/20 text-seen text-xs font-medium">
                  <Check size={12} />
                  Seen
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{entry.mission}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground mt-1 inline-block">
              {entry.category}
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              Date Spotted
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              License Plate (optional)
            </label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              placeholder="e.g. S AA 1234"
              className="w-full h-11 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            className={cn(
              'flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors',
              'bg-primary text-primary-foreground active:bg-primary/80'
            )}
          >
            <Check size={18} />
            {isSeen ? 'Update' : 'Mark as Seen'}
          </button>
          <button
            onClick={handleShare}
            className="h-12 w-12 rounded-xl bg-secondary text-foreground flex items-center justify-center active:bg-secondary/80"
          >
            <Share2 size={18} />
          </button>
          {isSeen && (
            <button
              onClick={handleRemove}
              className="h-12 w-12 rounded-xl bg-destructive/20 text-destructive flex items-center justify-center active:bg-destructive/30"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
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
