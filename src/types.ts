export interface MissionEntry {
  code: string
  mission: string
  emoji: string
  category: Category
  flagColors: string[]
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

const CODES = 'codes'
const MISSIONS = 'missions'
const CONTINENTS = 'continents'
const SEEN = 'seen'

export type SortMode = typeof CODES | typeof MISSIONS | typeof CONTINENTS | typeof SEEN

export const SortModeEnum = {
  CODES,
  MISSIONS,
  CONTINENTS,
  SEEN,
} as const

const CODE = 'code'
const MISSION = 'mission'

export type SearchMode = typeof CODE | typeof MISSION

export const SearchModeEnum = {
  CODE,
  MISSION,
} as const
