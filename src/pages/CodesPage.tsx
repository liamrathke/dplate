import { Search } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { CodeKeyboard } from '../components/CodeKeyboard'
import { PlateCard } from '../components/PlateCard'
import { PlateDetail } from '../components/PlateDetail'
import { useSightingsContext } from '../context/SightingsContext'
import { missions } from '../data/missions'
import { cn } from '../lib/utils'
import type { MissionEntry } from '../types'

export default function CodesPage() {
  const { isSeen, getSighting, markSeen, markUnseen } = useSightingsContext()
  const [selectedEntry, setSelectedEntry] = useState<MissionEntry | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [codeSearch, setCodeSearch] = useState('')

  const filtered = useMemo(() => {
    const result = codeSearch
      ? missions.filter((m) => m.code.startsWith(codeSearch.toUpperCase()))
      : [...missions]
    return result.sort((a, b) => a.code.localeCompare(b.code))
  }, [codeSearch])

  const handleSearchToggle = () => {
    if (searchOpen) {
      setSearchOpen(false)
      setCodeSearch('')
    } else {
      setSearchOpen(true)
    }
  }

  const handleHideSearch = () => {
    setSearchOpen(false)
    setCodeSearch('')
  }

  const handleCardClick = useCallback((entry: MissionEntry) => {
    setSelectedEntry(entry)
  }, [])

  return (
    <>
      {/* List */}
      <div className="flex-1 overflow-y-auto scroll-area pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm">No matching codes found</p>
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

      {/* Code keyboard */}
      {searchOpen && (
        <div className="shrink-0 bg-background border-t border-border pt-2 pb-2">
          <CodeKeyboard
            value={codeSearch}
            onChange={setCodeSearch}
            onHide={handleHideSearch}
          />
        </div>
      )}

      {/* Floating search button — hidden while keyboard is open */}
      {!searchOpen && (
        <button
          type="button"
          onClick={handleSearchToggle}
          className={cn(
            'fixed left-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors',
            codeSearch.length > 0
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground',
          )}
          style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        >
          <Search size={20} />
        </button>
      )}

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
