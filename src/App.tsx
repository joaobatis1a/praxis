import { Route, Routes } from 'react-router-dom'
import { LandingPage } from './features/landing/LandingPage'
import { LoginPage } from './features/auth/LoginPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { DesignSystemPage } from './pages/DesignSystemPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { AppLayout } from './features/dashboard/AppLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/design-system" element={<DesignSystemPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/usuarios" element={<ComingSoonPage title="Gestão de Usuários" />} />
          <Route path="/cargos" element={<ComingSoonPage title="Cargos e Permissões" />} />
          <Route path="/biblioteca" element={<ComingSoonPage title="Biblioteca de Conhecimento" />} />
          <Route path="/procedimentos" element={<ComingSoonPage title="Procedimentos Operacionais" />} />
          <Route path="/treinamentos" element={<ComingSoonPage title="Treinamentos" />} />
          <Route path="/trilhas" element={<ComingSoonPage title="Trilhas de Aprendizagem" />} />
          <Route path="/avaliacoes" element={<ComingSoonPage title="Avaliações" />} />
          <Route path="/notificacoes" element={<ComingSoonPage title="Central de Notificações" />} />
          <Route path="/configuracoes" element={<ComingSoonPage title="Configurações" />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
