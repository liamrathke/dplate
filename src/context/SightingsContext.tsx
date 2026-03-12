import { createContext, type ReactNode, useContext } from 'react'
import { useSightings } from '../hooks/useSightings'

type SightingsContextValue = ReturnType<typeof useSightings>

const SightingsContext = createContext<SightingsContextValue | null>(null)

export function SightingsProvider({ children }: { children: ReactNode }) {
  const value = useSightings()
  return (
    <SightingsContext.Provider value={value}>
      {children}
    </SightingsContext.Provider>
  )
}

export function useSightingsContext(): SightingsContextValue {
  const ctx = useContext(SightingsContext)
  if (!ctx)
    throw new Error('useSightingsContext must be used within SightingsProvider')
  return ctx
}
