import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { SightingsProvider } from './context/SightingsContext'
import CodesPage from './pages/CodesPage'
import ContinentsPage from './pages/ContinentsPage'
import MissionsPage from './pages/MissionsPage'
import SeenPage from './pages/SeenPage'

export default function App() {
  return (
    <SightingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/codes" replace />} />
            <Route path="codes" element={<CodesPage />} />
            <Route path="missions" element={<MissionsPage />} />
            <Route path="continents" element={<ContinentsPage />} />
            <Route path="seen" element={<SeenPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SightingsProvider>
  )
}
