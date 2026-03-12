import { ChevronRight, Menu, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CodeKeyboard } from './components/CodeKeyboard'
import { DataManagement } from './components/DataManagement'
import { PlateCard } from './components/PlateCard'
import { PlateDetail } from './components/PlateDetail'
import { missions } from './data/missions'
import { useSightings } from './hooks/useSightings'
import { cn } from './lib/utils'
import type { MissionEntry, SortMode } from './types'

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

const CATEGORY_EMOJI: Record<string, string> = {
  Africa: '🌍',
  Americas: '🌎',
  Asia: '🌏',
  Europe: '🌍',
  Oceania: '🌏',
  International: '🌐',
  Unknown: '❓',
}

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

  const totalUniqueCountries = useMemo(
    () => new Set(missions.map((m) => m.mission)).size,
    [],
  )
  const seenUniqueCountries = useMemo(
    () => new Set(missions.filter((m) => isSeen(m.code)).map((m) => m.mission)).size,
    [isSeen],
  )

  const [selectedEntry, setSelectedEntry] = useState<MissionEntry | null>(null)
  const [showDataMgmt, setShowDataMgmt] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('code')
  const searchMode = sortMode === 'code' ? 'code' : 'mission'
  const [searchOpen, setSearchOpen] = useState(false)
  const [codeSearch, setCodeSearch] = useState('')
  const [missionSearch, setMissionSearch] = useState('')
  const missionInputRef = useRef<HTMLInputElement>(null)

  // Clear stale search when mode changes due to tab switch
  useEffect(() => {
    if (searchMode === 'code') setMissionSearch('')
    else setCodeSearch('')
  }, [searchMode])

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

    if (sortMode === 'seen') {
      result = result.filter((m) => isSeen(m.code))
      result.sort((a, b) => {
        const aDate = getSighting(a.code)?.date ?? ''
        const bDate = getSighting(b.code)?.date ?? ''
        return bDate.localeCompare(aDate) // most recent first
      })
    } else {
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
            const missionDiff = a.mission.localeCompare(b.mission)
            if (missionDiff !== 0) return missionDiff
            return a.code.localeCompare(b.code)
          }
          default:
            return 0
        }
      })
    }

    return result
  }, [sortMode, searchMode, codeSearch, missionSearch, isSeen, getSighting])

  const categoryGroups = useMemo(() => {
    if (sortMode !== 'category') return null
    const groups: { category: string; entries: MissionEntry[]; seenCountries: number; totalCountries: number }[] = []
    let currentCategory = ''
    let currentEntries: MissionEntry[] = []

    for (const entry of filteredAndSorted) {
      if (entry.category !== currentCategory) {
        if (currentEntries.length > 0) {
          const uniqueMissions = new Set(currentEntries.map((e) => e.mission))
          const seenMissions = new Set(currentEntries.filter((e) => isSeen(e.code)).map((e) => e.mission))
          groups.push({ category: currentCategory, entries: currentEntries, seenCountries: seenMissions.size, totalCountries: uniqueMissions.size })
        }
        currentCategory = entry.category
        currentEntries = []
      }
      currentEntries.push(entry)
    }
    if (currentEntries.length > 0) {
      const uniqueMissions = new Set(currentEntries.map((e) => e.mission))
      const seenMissions = new Set(currentEntries.filter((e) => isSeen(e.code)).map((e) => e.mission))
      groups.push({ category: currentCategory, entries: currentEntries, seenCountries: seenMissions.size, totalCountries: uniqueMissions.size })
    }
    return groups
  }, [sortMode, filteredAndSorted, isSeen])

  const handleCardClick = useCallback((entry: MissionEntry) => {
    setSelectedEntry(entry)
  }, [])

  return (
    <div className="flex flex-col h-full px-[1em]">
      {/* Header */}
      <header className="relative shrink-0 pt-3 pb-2 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">DPlate</h1>
        <p className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground pointer-events-none">
          {seenUniqueCountries}/{totalUniqueCountries} spotted
        </p>
        <button
          type="button"
          onClick={() => setShowDataMgmt(true)}
          className="p-2 rounded-lg bg-card text-muted-foreground active:bg-secondary"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Sort options row */}
      <div className="shrink-0 pb-2">
        <div className="flex gap-2">
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
      </div>

      {/* Search panel: country text input (when not on Code tab) */}
      {searchOpen && searchMode === 'mission' && (
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

      {/* List */}
      <div className="flex-1 overflow-y-auto scroll-area pb-4">
        {filteredAndSorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm">No matching codes found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortMode === 'category' && categoryGroups ? (
              <div className="space-y-2">
                {categoryGroups.map((group) => (
                  <details key={group.category} className="group">
                    <summary className="flex items-center gap-2.5 px-3 py-4 rounded-xl bg-card cursor-pointer list-none">
                      <ChevronRight size={18} className="text-muted-foreground shrink-0 transition-transform group-open:rotate-90" />
                      <span className="text-xl shrink-0">{CATEGORY_EMOJI[group.category] ?? '🌍'}</span>
                      <span className="font-bold text-base shrink-0">{group.category}</span>
                      <div className="ml-auto flex items-center gap-2">
                        <div className="w-[120px] h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-seen transition-all"
                            style={{ width: `${group.totalCountries > 0 ? (group.seenCountries / group.totalCountries) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
                          {group.seenCountries}/{group.totalCountries}
                        </span>
                      </div>
                    </summary>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {group.entries.map((entry) => (
                        <PlateCard
                          key={entry.code}
                          entry={entry}
                          seen={isSeen(entry.code)}
                          date={getSighting(entry.code)?.date}
                          onClick={() => handleCardClick(entry)}
                        />
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
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
            )}
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

      {/* Floating search button — hidden when code keyboard is open */}
      {!(searchOpen && searchMode === 'code') && (
        <button
          type="button"
          onClick={handleSearchIconClick}
          className={cn(
            'fixed left-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors',
            searchOpen || isSearchActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground',
          )}
          style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        >
          <Search size={20} />
        </button>
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
