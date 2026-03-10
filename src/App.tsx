import { Keyboard, Menu, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CodeKeyboard } from './components/CodeKeyboard'
import { DataManagement } from './components/DataManagement'
import { PlateCard } from './components/PlateCard'
import { PlateDetail } from './components/PlateDetail'
import { missions } from './data/missions'
import { useSightings } from './hooks/useSightings'
import { cn } from './lib/utils'
import type { MissionEntry, SearchMode, SortMode } from './types'

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'code', label: 'Code' },
  { value: 'mission', label: 'Country' },
  { value: 'category', label: 'Continent' },
  { value: 'seen', label: 'Seen' },
]

const CATEGORY_ORDER = [
  'Africa',
  'Americas',
  'Asia',
  'Europe',
  'Oceania',
  'International',
  'Unknown',
]

export default function App() {
  const {
    markSeen,
    markUnseen,
    isSeen,
    getSighting,
    exportData,
    importData,
    seenCount,
  } = useSightings()

  const [selectedEntry, setSelectedEntry] = useState<MissionEntry | null>(null)
  const [showDataMgmt, setShowDataMgmt] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('code')
  const [searchMode, setSearchMode] = useState<SearchMode>('code')
  const [searchOpen, setSearchOpen] = useState(false)
  const [codeSearch, setCodeSearch] = useState('')
  const [missionSearch, setMissionSearch] = useState('')
  const missionInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen && searchMode === 'mission') {
      setTimeout(() => missionInputRef.current?.focus(), 50)
    }
  }, [searchOpen, searchMode])

  const handleSearchIconClick = () => {
    if (searchOpen) {
      setSearchOpen(false)
      setCodeSearch('')
      setMissionSearch('')
    } else {
      setSearchOpen(true)
    }
  }

  const handleHideSearch = () => {
    setSearchOpen(false)
    setCodeSearch('')
    setMissionSearch('')
  }

  const isSearchActive = codeSearch.length > 0 || missionSearch.length > 0

  const filteredAndSorted = useMemo(() => {
    let result = [...missions]

    if (searchMode === 'code' && codeSearch) {
      result = result.filter((m) => m.code.startsWith(codeSearch.toUpperCase()))
    } else if (searchMode === 'mission' && missionSearch) {
      const q = missionSearch.toLowerCase()
      result = result.filter(
        (m) =>
          m.mission.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q),
      )
    }

    result.sort((a, b) => {
      switch (sortMode) {
        case 'code':
          return a.code.localeCompare(b.code)
        case 'mission':
          return a.mission.localeCompare(b.mission)
        case 'category': {
          const catDiff =
            CATEGORY_ORDER.indexOf(a.category) -
            CATEGORY_ORDER.indexOf(b.category)
          if (catDiff !== 0) return catDiff
          return a.code.localeCompare(b.code)
        }
        case 'seen': {
          const aS = isSeen(a.code) ? 0 : 1
          const bS = isSeen(b.code) ? 0 : 1
          if (aS !== bS) return aS - bS
          return a.code.localeCompare(b.code)
        }
        default:
          return 0
      }
    })

    return result
  }, [sortMode, searchMode, codeSearch, missionSearch, isSeen])

  const handleCardClick = useCallback((entry: MissionEntry) => {
    setSelectedEntry(entry)
  }, [])

  return (
    <div className="flex flex-col h-full px-[1em]">
      {/* Header */}
      <header className="relative shrink-0 pt-3 pb-2 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">DPlate</h1>
        <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground pointer-events-none">
          {seenCount}/{missions.length} spotted
        </p>
        <button
          type="button"
          onClick={() => setShowDataMgmt(true)}
          className="p-2 rounded-lg bg-card text-muted-foreground active:bg-secondary"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Sort options row + search icon */}
      <div className="shrink-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 flex-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setSortMode(opt.value)}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-xs font-medium transition-colors',
                  sortMode === opt.value
                    ? 'bg-primary/20 text-primary'
                    : 'bg-card text-muted-foreground',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSearchIconClick}
            className={cn(
              'shrink-0 px-3 py-2.5 rounded-lg transition-colors',
              searchOpen || isSearchActive
                ? 'bg-primary/20 text-primary'
                : 'bg-card text-muted-foreground',
            )}
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Search panel */}
      {searchOpen && (
        <>
          {/* Mode toggle: Code / Country */}
          <div className="shrink-0 pb-2">
            <div className="flex gap-1 p-1 bg-card rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setSearchMode('code')
                  setMissionSearch('')
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  searchMode === 'code'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground',
                )}
              >
                <Keyboard size={12} />
                Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMode('mission')
                  setCodeSearch('')
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  searchMode === 'mission'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground',
                )}
              >
                <Search size={12} />
                Country
              </button>
            </div>
          </div>

          {/* Country text input */}
          {searchMode === 'mission' && (
            <div className="shrink-0 pb-2">
              <input
                ref={missionInputRef}
                type="text"
                value={missionSearch}
                onChange={(e) => setMissionSearch(e.target.value)}
                placeholder="Search countries..."
                className="w-full h-10 px-3 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
              />
            </div>
          )}
        </>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto scroll-area pb-4">
        {filteredAndSorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm">No matching codes found</p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-1 gap-2">
            {filteredAndSorted.map((entry) => (
              <PlateCard
                key={entry.code}
                entry={entry}
                seen={isSeen(entry.code)}
                date={getSighting(entry.code)?.date}
                onClick={() => handleCardClick(entry)}
              />
            ))}
          </div>
          </div>
        )}
      </div>

      {/* Code keyboard */}
      {searchOpen && searchMode === 'code' && (
        <div className="shrink-0 bg-background border-t border-border pt-2 pb-2">
          <CodeKeyboard
            value={codeSearch}
            onChange={setCodeSearch}
            onHide={handleHideSearch}
          />
        </div>
      )}

      {/* Detail sheet */}
      {selectedEntry && (
        <PlateDetail
          entry={selectedEntry}
          sighting={getSighting(selectedEntry.code)}
          onClose={() => setSelectedEntry(null)}
          onMarkSeen={markSeen}
          onMarkUnseen={markUnseen}
        />
      )}

      {/* Data management sheet */}
      {showDataMgmt && (
        <DataManagement
          onClose={() => setShowDataMgmt(false)}
          onExport={exportData}
          onImport={importData}
          seenCount={seenCount}
          totalCount={missions.length}
        />
      )}
    </div>
  )
}
