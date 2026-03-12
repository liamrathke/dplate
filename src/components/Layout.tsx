import { Menu } from 'lucide-react'
import { useMemo, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useSightingsContext } from '../context/SightingsContext'
import { missions } from '../data/missions'
import { cn } from '../lib/utils'
import { DataManagement } from './DataManagement'

const NAV_TABS = [
  { path: '/codes', label: 'Code' },
  { path: '/missions', label: 'Country' },
  { path: '/continents', label: 'Continent' },
  { path: '/seen', label: 'Seen' },
]

export default function Layout() {
  const { exportData, importData, seenCount, isSeen } = useSightingsContext()
  const [showDataMgmt, setShowDataMgmt] = useState(false)

  const totalUniqueCountries = useMemo(
    () => new Set(missions.map((m) => m.mission)).size,
    [],
  )
  const seenUniqueCountries = useMemo(
    () => new Set(missions.filter((m) => isSeen(m.code)).map((m) => m.mission)).size,
    [isSeen],
  )

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

      {/* Tab navigation */}
      <nav className="shrink-0 pb-2">
        <div className="flex gap-2">
          {NAV_TABS.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                cn(
                  'flex-1 py-2.5 rounded-lg text-xs font-medium transition-colors text-center',
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'bg-card text-muted-foreground',
                )
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Page content */}
      <Outlet />

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
