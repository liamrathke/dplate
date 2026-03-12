export interface MissionEntry {
  code: string
  mission: string
  emoji: string
  category: Category
}

const AFRICA = 'Africa'
const ASIA = 'Asia'
const EUROPE = 'Europe'
const AMERICAS = 'Americas'
const OCEANIA = 'Oceania'
const INTERNATIONAL = 'International'
const UNKNOWN = 'Unknown'

export type Category = typeof AFRICA | typeof ASIA | typeof EUROPE | typeof AMERICAS | typeof OCEANIA | typeof INTERNATIONAL | typeof UNKNOWN

export const CategoryEnum = {
  AFRICA,
  ASIA,
  EUROPE,
  AMERICAS,
  OCEANIA,
  INTERNATIONAL,
  UNKNOWN,
} as const

export interface Sighting {
  date: string
  plate: string
  notes?: string
}

export type SightingsData = Record<string, Sighting>

export type SortMode = 'code' | 'mission' | 'category' | 'seen'

export type SearchMode = 'code' | 'mission'
