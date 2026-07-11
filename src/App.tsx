import { Navigate, Route, Routes } from 'react-router-dom'
import { DesignSystemPage } from './pages/DesignSystemPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/design-system" replace />} />
      <Route path="/design-system" element={<DesignSystemPage />} />
    </Routes>
  )
}

export default App
