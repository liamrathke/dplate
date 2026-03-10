import { useState, useCallback, useEffect } from 'react'
import type { Sighting, SightingsData } from '../types'

const STORAGE_KEY = 'dplate-sightings'

function loadSightings(): SightingsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as SightingsData
  } catch {
    // ignore corrupt data
  }
  return {}
}

function saveSightings(data: SightingsData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useSightings() {
  const [sightings, setSightings] = useState<SightingsData>(loadSightings)

  useEffect(() => {
    saveSightings(sightings)
  }, [sightings])

  const markSeen = useCallback((code: string, sighting: Sighting) => {
    setSightings((prev) => ({ ...prev, [code]: sighting }))
  }, [])

  const markUnseen = useCallback((code: string) => {
    setSightings((prev) => {
      const next = { ...prev }
      delete next[code]
      return next
    })
  }, [])

  const isSeen = useCallback(
    (code: string) => code in sightings,
    [sightings]
  )

  const getSighting = useCallback(
    (code: string) => sightings[code] ?? null,
    [sightings]
  )

  const exportData = useCallback(() => {
    return JSON.stringify(sightings, null, 2)
  }, [sightings])

  const importData = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as SightingsData
      // Validate shape: every value must have date string
      for (const val of Object.values(parsed)) {
        if (typeof val.date !== 'string') throw new Error('Invalid data')
      }
      setSightings(parsed)
      return true
    } catch {
      return false
    }
  }, [])

  const seenCount = Object.keys(sightings).length

  return {
    sightings,
    markSeen,
    markUnseen,
    isSeen,
    getSighting,
    exportData,
    importData,
    seenCount,
  }
}
