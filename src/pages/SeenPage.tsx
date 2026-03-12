import { Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PlateCard } from '../components/PlateCard'
import { PlateDetail } from '../components/PlateDetail'
import { useSightingsContext } from '../context/SightingsContext'
import { missions } from '../data/missions'
import { cn } from '../lib/utils'
import type { MissionEntry } from '../types'

export default function SeenPage() {
  const { isSeen, getSighting, markSeen, markUnseen } = useSightingsContext()
  const [selectedEntry, setSelectedEntry] = useState<MissionEntry | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [searchOpen])

  const filtered = useMemo(() => {
    let result = missions.filter((m) => isSeen(m.code))
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (m) => m.mission.toLowerCase().includes(q) || m.code.toLowerCase().includes(q),
      )
    }
    return result.sort((a, b) => {
      const aDate = getSighting(a.code)?.date ?? ''
      const bDate = getSighting(b.code)?.date ?? ''
      return bDate.localeCompare(aDate)
    })
  }, [isSeen, getSighting, query])

  const handleSearchToggle = () => {
    if (searchOpen) {
      setSearchOpen(false)
      setQuery('')
    } else {
      setSearchOpen(true)
    }
  }

  const handleCardClick = useCallback((entry: MissionEntry) => {
    setSelectedEntry(entry)
  }, [])

  return (
    <>
      {searchOpen && (
        <div className="shrink-0 pb-2">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search seen..."
            className="w-full h-10 px-3 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto scroll-area pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm">{query ? 'No matching codes found' : 'No plates spotted yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {filtered.map((entry) => (
              <PlateCard
                key={entry.code}
                entry={entry}
                seen={isSeen(entry.code)}
                date={getSighting(entry.code)?.date}
                onClick={() => handleCardClick(entry)}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSearchToggle}
        className={cn(
          'fixed left-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors',
          searchOpen || query.length > 0
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground',
        )}
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <Search size={20} />
      </button>

      {selectedEntry && (
        <PlateDetail
          entry={selectedEntry}
          sighting={getSighting(selectedEntry.code)}
          onClose={() => setSelectedEntry(null)}
          onMarkSeen={markSeen}
          onMarkUnseen={markUnseen}
        />
      )}
    </>
  )
}
