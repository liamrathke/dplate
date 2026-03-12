import { ChevronRight, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PlateCard } from '../components/PlateCard'
import { PlateDetail } from '../components/PlateDetail'
import { useSightingsContext } from '../context/SightingsContext'
import { missions } from '../data/missions'
import { cn } from '../lib/utils'
import { CategoryEnum, type MissionEntry } from '../types'

const CATEGORY_ORDER = [
  CategoryEnum.AFRICA,
  CategoryEnum.AMERICAS,
  CategoryEnum.ASIA,
  CategoryEnum.EUROPE,
  CategoryEnum.OCEANIA,
  CategoryEnum.INTERNATIONAL,
  CategoryEnum.UNKNOWN,
]

const CATEGORY_EMOJI: Record<string, string> = {
  [CategoryEnum.AFRICA]: '🌍',
  [CategoryEnum.AMERICAS]: '🌎',
  [CategoryEnum.ASIA]: '🌏',
  [CategoryEnum.EUROPE]: '🌍',
  [CategoryEnum.OCEANIA]: '🌏',
  [CategoryEnum.INTERNATIONAL]: '🌐',
  [CategoryEnum.UNKNOWN]: '❓',
}

export default function ContinentsPage() {
  const { isSeen, getSighting, markSeen, markUnseen } = useSightingsContext()
  const [selectedEntry, setSelectedEntry] = useState<MissionEntry | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [searchOpen])

  const sorted = useMemo(() => {
    let result = [...missions]
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(
        (m) => m.mission.toLowerCase().includes(q) || m.code.toLowerCase().includes(q),
      )
    }
    return result.sort((a, b) => {
      const catDiff = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
      if (catDiff !== 0) return catDiff
      const missionDiff = a.mission.localeCompare(b.mission)
      if (missionDiff !== 0) return missionDiff
      return a.code.localeCompare(b.code)
    })
  }, [query])

  const categoryGroups = useMemo(() => {
    const groups: {
      category: string
      entries: MissionEntry[]
      seenCountries: number
      totalCountries: number
    }[] = []
    let currentCategory = ''
    let currentEntries: MissionEntry[] = []

    for (const entry of sorted) {
      if (entry.category !== currentCategory) {
        if (currentEntries.length > 0) {
          const uniqueMissions = new Set(currentEntries.map((e) => e.mission))
          const seenMissions = new Set(
            currentEntries.filter((e) => isSeen(e.code)).map((e) => e.mission),
          )
          groups.push({
            category: currentCategory,
            entries: currentEntries,
            seenCountries: seenMissions.size,
            totalCountries: uniqueMissions.size,
          })
        }
        currentCategory = entry.category
        currentEntries = []
      }
      currentEntries.push(entry)
    }
    if (currentEntries.length > 0) {
      const uniqueMissions = new Set(currentEntries.map((e) => e.mission))
      const seenMissions = new Set(
        currentEntries.filter((e) => isSeen(e.code)).map((e) => e.mission),
      )
      groups.push({
        category: currentCategory,
        entries: currentEntries,
        seenCountries: seenMissions.size,
        totalCountries: uniqueMissions.size,
      })
    }
    return groups
  }, [sorted, isSeen])

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
            placeholder="Search countries..."
            className="w-full h-10 px-3 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto scroll-area pb-4">
        {categoryGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm">No matching countries found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categoryGroups.map((group) => (
              <details key={group.category} className="group">
                <summary className="flex items-center gap-2.5 px-3 py-4 rounded-xl bg-card cursor-pointer list-none">
                  <ChevronRight
                    size={18}
                    className="text-muted-foreground shrink-0 transition-transform group-open:rotate-90"
                  />
                  <span className="text-xl shrink-0">
                    {CATEGORY_EMOJI[group.category] ?? '🌍'}
                  </span>
                  <span className="font-bold text-base shrink-0">{group.category}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-[120px] h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-seen transition-all"
                        style={{
                          width: `${group.totalCountries > 0 ? (group.seenCountries / group.totalCountries) * 100 : 0}%`,
                        }}
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
