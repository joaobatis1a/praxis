import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button, Checkbox, Input, Logo } from '../../components/ui'
import { isSupabase } from '../../lib/dataSource'
import { useAuth } from './AuthContext'
import { GoogleIcon } from './components/GoogleIcon'
import { LoginShowcasePanel } from './components/LoginShowcasePanel'
import { KnowledgeGraph } from '../landing/components/KnowledgeGraph'

const demoAccounts = [
  { label: 'Admin', email: 'admin@praxis.com' },
  { label: 'Gestor', email: 'gestor@praxis.com' },
  { label: 'Colaborador', email: 'colaborador@praxis.com' },
]

export function LoginPage() {
  const { login, loginWithGoogle, isAuthenticating, error, user, ownerNoCompany, noCompanySession } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // covers the Google OAuth redirect-back landing here with a session already set, the Praxis
  // owner logging in with no company profile (→ Central de Suporte), and anyone else logging in
  // with no company profile (→ the signup page's join-a-company screen)
  useEffect(() => {
    if (user) navigate('/dashboard')
    else if (ownerNoCompany) navigate('/suporte')
    else if (noCompanySession) navigate('/signup')
  }, [user, ownerNoCompany, noCompanySession, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await login(email, password)
      // navigation happens via the effect above once context state updates
    } catch {
      // error already surfaced via context state
    }
  }

  return (
    <div className="dark relative flex h-dvh overflow-hidden bg-[#050810]">
      <Link
        to="/"
        className="absolute left-6 top-6 z-20 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <div className="relative flex w-full flex-col justify-center overflow-y-auto px-6 py-12 sm:px-12 md:w-1/2 lg:px-20">
        <div className="absolute inset-0 z-0 opacity-50">
          <KnowledgeGraph />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#050810] via-[#050810]/40 to-[#050810]/70" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 mx-auto w-full max-w-sm"
        >
          <Link to="/">
            <Logo textClassName="text-white" />
          </Link>
          <p className="mt-1 text-xs text-white/40">Práxis: da ação à execução.</p>

          <h1 className="mt-8 text-2xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="mt-1 text-sm text-white/50">Entre para acessar sua conta.</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="voce@empresa.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="rounded-sm p-1.5 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <Checkbox label="Lembrar acesso" defaultChecked />
              <a href="#" className="text-sm font-medium text-[#6d94fa] hover:underline">
                Esqueci minha senha
              </a>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-md bg-error-bg px-3 py-2 text-sm text-error-foreground"
              >
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={isAuthenticating}
              className="mt-2 shadow-[0_0_0_0_rgba(79,125,249,0.5)] transition-shadow hover:shadow-[0_0_28px_4px_rgba(79,125,249,0.4)]"
            >
              {isAuthenticating && <Loader2 size={18} className="animate-spin" />}
              {isAuthenticating ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {isSupabase && (
            <>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-white/40">ou</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <button
                type="button"
                onClick={loginWithGoogle}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-white/15 bg-white/[0.03] text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <GoogleIcon />
                Continuar com Google
              </button>
            </>
          )}

          {!isSupabase && (
            <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Contas de demonstração
              </p>
              <ul className="mt-2 space-y-1">
                {demoAccounts.map((account) => (
                  <li key={account.email}>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(account.email)
                        setPassword('senha123')
                      }}
                      className="text-sm text-white/60 hover:text-[#6d94fa]"
                    >
                      <span className="font-medium">{account.label}:</span> {account.email}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-white/40">Senha para todas: senha123</p>
            </div>
          )}
        </motion.div>
      </div>

      <LoginShowcasePanel />
    </div>
  )
}
