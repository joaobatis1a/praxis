import { Route, Routes } from 'react-router-dom'
import { LandingPage } from './features/landing/LandingPage'
import { DesignSystemPage } from './pages/DesignSystemPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/design-system" element={<DesignSystemPage />} />
    </Routes>
  )
}

export default App
