export interface MissionEntry {
  code: string
  mission: string
  emoji: string
  category: Category
}

export type Category =
  | 'Africa'
  | 'Asia'
  | 'Europe'
  | 'Americas'
  | 'Oceania'
  | 'International'
  | 'Unknown'

export interface Sighting {
  date: string
  plate: string
}

export type SightingsData = Record<string, Sighting>

export type SortMode = 'code' | 'mission' | 'category' | 'seen'

export type SearchMode = 'code' | 'mission'
