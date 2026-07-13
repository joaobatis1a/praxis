import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './lib/theme-provider'
import { AuthProvider } from './features/auth/AuthContext'
import { ToastProvider } from './components/ui'
import { isSupabase } from './lib/dataSource'
import App from './App.tsx'
import './index.css'

document.title = isSupabase ? 'Praxis' : 'Praxis: Demonstração'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
