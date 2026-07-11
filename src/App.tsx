import { Route, Routes } from 'react-router-dom'
import { LandingPage } from './features/landing/LandingPage'
import { LoginPage } from './features/auth/LoginPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { DesignSystemPage } from './pages/DesignSystemPage'
import { DashboardPlaceholderPage } from './pages/DashboardPlaceholderPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/design-system" element={<DesignSystemPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPlaceholderPage />} />
      </Route>
    </Routes>
  )
}

export default App
