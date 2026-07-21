import { Navigate, Route, Routes } from 'react-router-dom'
import { LandingPage } from './features/landing/LandingPage'
import { LoginPage } from './features/auth/LoginPage'
import { SignupPage } from './features/auth/SignupPage'
import { ResetPasswordPage } from './features/auth/ResetPasswordPage'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { RequireCompanyProfile } from './features/auth/RequireCompanyProfile'
import { DesignSystemPage } from './pages/DesignSystemPage'
import { AppLayout } from './features/dashboard/AppLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { UsersPage } from './features/users/UsersPage'
import { RequireRole } from './features/auth/RequireRole'
import { RolesPermissionsPage } from './features/roles/RolesPermissionsPage'
import { LibraryPage } from './features/library/LibraryPage'
import { ProceduresPage } from './features/procedures/ProceduresPage'
import { NoticesPage } from './features/notices/NoticesPage'
import { NotificationsPage } from './features/notifications/NotificationsPage'
import { SettingsPage } from './features/settings/SettingsPage'
import { ProfilePage } from './features/settings/ProfilePage'
import { SupportPage } from './features/support/SupportPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      <Route path="/design-system" element={<DesignSystemPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<RequireCompanyProfile />}>
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
            <Route path="/notificacoes" element={<NotificationsPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
          </Route>

          {/* reachable both by normal company users and by the owner with no company (ownerNoCompany) */}
          <Route path="/suporte" element={<SupportPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
