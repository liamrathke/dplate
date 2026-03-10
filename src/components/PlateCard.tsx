import type { MissionEntry } from '../types'
import { cn } from '../lib/utils'
import { Check } from 'lucide-react'

interface PlateCardProps {
  entry: MissionEntry
  seen: boolean
  date?: string
  onClick: () => void
}

export function PlateCard({ entry, seen, date, onClick }: PlateCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left',
        'active:bg-secondary/80',
        seen ? 'bg-seen/5' : 'bg-card'
      )}
    >
      {/* Flag */}
      <span className="text-2xl w-9 text-center shrink-0">{entry.emoji}</span>

      {/* Code + Mission name — larger, fills the row height */}
      <div className="flex-1 min-w-0 flex items-baseline gap-2">
        <span className="font-mono font-bold text-lg leading-tight shrink-0">{entry.code}</span>
        <span className="text-base font-medium truncate leading-tight">
          {entry.mission}
        </span>
      </div>

      {/* Right side: category badge + date */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        <span className="text-[11px] px-1.5 py-0.5 m-1 rounded-full bg-secondary text-muted-foreground whitespace-nowrap">
          {entry.category}
        </span>
        {seen && date && (
          <span className="text-[11px] text-seen/70">{date}</span>
        )}
      </div>

      {/* Seen indicator */}
      <div className="shrink-0">
        {seen ? (
          <div className="w-7 h-7 rounded-full bg-seen/20 flex items-center justify-center">
            <Check size={16} className="text-seen" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full border-2 border-border" />
        )}
      </div>
    </button>
  )
}
