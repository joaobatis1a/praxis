import { Route, Routes } from 'react-router-dom'
import { LandingPage } from './features/landing/LandingPage'
import { LoginPage } from './features/auth/LoginPage'
import { SignupPage } from './features/auth/SignupPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { DesignSystemPage } from './pages/DesignSystemPage'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { AppLayout } from './features/dashboard/AppLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { UsersPage } from './features/users/UsersPage'
import { RequireRole } from './features/auth/RequireRole'
import { RolesPermissionsPage } from './features/roles/RolesPermissionsPage'
import { LibraryPage } from './features/library/LibraryPage'
import { ProceduresPage } from './features/procedures/ProceduresPage'
import { NoticesPage } from './features/notices/NoticesPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/design-system" element={<DesignSystemPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route element={<RequireRole roles={['admin', 'gestor']} />}>
            <Route path="/usuarios" element={<UsersPage />} />
          </Route>
          <Route element={<RequireRole roles={['admin']} />}>
            <Route path="/cargos" element={<RolesPermissionsPage />} />
          </Route>
          <Route path="/biblioteca" element={<LibraryPage />} />
          <Route path="/procedimentos" element={<ProceduresPage />} />
          <Route path="/avisos" element={<NoticesPage />} />
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
