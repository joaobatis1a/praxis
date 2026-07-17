import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Building2, KeyRound, Loader2 } from 'lucide-react'
import { Button, Input, Logo } from '../../components/ui'
import { isSupabase } from '../../lib/dataSource'
import { useAuth } from './AuthContext'
import { finishGoogleCodeSignup, finishGoogleCompanySignup, signupCompanyRequest, signupWithCodeRequest, signupWithGoogle } from './api'
import { LoginShowcasePanel } from './components/LoginShowcasePanel'
import { KnowledgeGraph } from '../landing/components/KnowledgeGraph'
import { GoogleIcon } from './components/GoogleIcon'

type Step = 'choice' | 'company' | 'code'

const initialOauthIntent = new URLSearchParams(window.location.search).get('oauthIntent')

export function SignupPage() {
  const [step, setStep] = useState<Step>(initialOauthIntent === 'code' ? 'code' : initialOauthIntent === 'company' ? 'company' : 'choice')
  const {
    setSessionUser,
    user,
    error: authError,
    pendingGoogleUser,
    clearPendingGoogleUser,
    noCompanySession,
    clearNoCompanySession,
    ownerNoCompany,
  } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [companyForm, setCompanyForm] = useState({ companyName: '', name: '', email: '', password: '' })
  const [codeForm, setCodeForm] = useState({ name: '', email: '', password: '', code: '' })
  const [googleCompanyName, setGoogleCompanyName] = useState('')
  const [googleCode, setGoogleCode] = useState('')

  const displayError = error || authError
  // pendingGoogleUser (fresh Google signup) and noCompanySession (logged in, no company —
  // e.g. after "Sair da empresa") both finish the same way: pick "Criar empresa" or "Tenho um
  // código" for an *existing* Supabase Auth user, no new account created.
  const identity = pendingGoogleUser ?? noCompanySession

  // covers the Google OAuth redirect-back landing here with a session (and profile) already set,
  // and the Praxis owner arriving here with no company (routed to Central de Suporte instead)
  useEffect(() => {
    if (user) navigate('/dashboard')
    else if (ownerNoCompany) navigate('/suporte')
  }, [user, ownerNoCompany, navigate])

  function goBack() {
    setError(null)
    if (pendingGoogleUser) clearPendingGoogleUser()
    if (noCompanySession) clearNoCompanySession()
    window.history.replaceState({}, '', '/signup')
    setStep('choice')
  }

  async function handleCompanySubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const user = await signupCompanyRequest(companyForm)
      setSessionUser(user)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a empresa.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCodeSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const user = await signupWithCodeRequest(codeForm)
      setSessionUser(user)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar com esse código.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleFinishGoogleCompany(e: FormEvent) {
    e.preventDefault()
    if (!identity) return
    setSubmitting(true)
    setError(null)
    try {
      const authUser = await finishGoogleCompanySignup(googleCompanyName.trim(), identity)
      window.history.replaceState({}, '', '/signup')
      setSessionUser(authUser)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a empresa.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleFinishGoogleCode(e: FormEvent) {
    e.preventDefault()
    if (!identity) return
    setSubmitting(true)
    setError(null)
    try {
      const authUser = await finishGoogleCodeSignup(googleCode.trim(), identity)
      window.history.replaceState({}, '', '/signup')
      setSessionUser(authUser)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar com esse código.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dark relative flex h-dvh overflow-hidden bg-[#050810]">
      <button
        type="button"
        onClick={() => {
          if (step === 'choice') navigate('/')
          else goBack()
        }}
        className="absolute left-6 top-6 z-20 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

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

          {step === 'choice' && (
            <>
              <h1 className="mt-8 text-2xl font-bold text-white">Criar conta</h1>
              <p className="mt-1 text-sm text-white/50">Como você quer começar?</p>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setStep('company')
                  }}
                  className="flex w-full items-start gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-primary/50 hover:bg-white/[0.06]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[#6d94fa]">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Criar empresa</p>
                    <p className="mt-0.5 text-xs text-white/50">
                      Sua empresa ainda não usa o Praxis. Você será o administrador.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setStep('code')
                  }}
                  className="flex w-full items-start gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-primary/50 hover:bg-white/[0.06]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[#6d94fa]">
                    <KeyRound size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Tenho um código</p>
                    <p className="mt-0.5 text-xs text-white/50">
                      Sua empresa já usa o Praxis. Entre com o código que seu gestor te enviou.
                    </p>
                  </div>
                </button>
              </div>

              {!noCompanySession && (
                <p className="mt-8 text-sm text-white/50">
                  Já tem conta?{' '}
                  <Link to="/login" className="font-medium text-[#6d94fa] hover:underline">
                    Entrar
                  </Link>
                </p>
              )}
            </>
          )}

          {step === 'company' && identity && (
            <>
              <h1 className="mt-8 text-2xl font-bold text-white">Só falta o nome da empresa</h1>
              <p className="mt-1 text-sm text-white/50">
                Entrando como <span className="text-white/80">{identity.email}</span>. Você será o administrador.
              </p>

              <form onSubmit={handleFinishGoogleCompany} className="mt-6 flex flex-col gap-4">
                <Input
                  label="Nome da empresa"
                  required
                  autoFocus
                  value={googleCompanyName}
                  onChange={(e) => setGoogleCompanyName(e.target.value)}
                />

                {displayError && (
                  <div role="alert" className="flex items-center gap-2 rounded-md bg-error-bg px-3 py-2 text-sm text-error-foreground">
                    <AlertCircle size={16} className="shrink-0" />
                    {displayError}
                  </div>
                )}

                <Button type="submit" size="lg" disabled={submitting} className="mt-2">
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Criando...' : 'Criar empresa'}
                </Button>
              </form>
            </>
          )}

          {step === 'company' && !identity && (
            <>
              <h1 className="mt-8 text-2xl font-bold text-white">Crie sua empresa</h1>
              <p className="mt-1 text-sm text-white/50">Você será o administrador da conta.</p>

              <form onSubmit={handleCompanySubmit} className="mt-6 flex flex-col gap-4">
                <Input
                  label="Nome da empresa"
                  required
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                />
                <Input
                  label="Seu nome"
                  required
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                />
                <Input
                  label="E-mail"
                  type="email"
                  required
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                />
                <Input
                  label="Senha"
                  type="password"
                  required
                  minLength={6}
                  value={companyForm.password}
                  onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                />

                {displayError && (
                  <div role="alert" className="flex items-center gap-2 rounded-md bg-error-bg px-3 py-2 text-sm text-error-foreground">
                    <AlertCircle size={16} className="shrink-0" />
                    {displayError}
                  </div>
                )}

                <Button type="submit" size="lg" disabled={submitting} className="mt-2">
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Criando...' : 'Criar empresa'}
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
                    onClick={() => signupWithGoogle('company')}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-white/15 bg-white/[0.03] text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    <GoogleIcon />
                    Continuar com Google
                  </button>
                </>
              )}
            </>
          )}

          {step === 'code' && identity && (
            <>
              <h1 className="mt-8 text-2xl font-bold text-white">Só falta o código</h1>
              <p className="mt-1 text-sm text-white/50">
                Entrando como <span className="text-white/80">{identity.email}</span>. Peça o código ao seu gestor ou administrador.
              </p>

              <form onSubmit={handleFinishGoogleCode} className="mt-6 flex flex-col gap-4">
                <Input
                  label="Código da empresa"
                  required
                  autoFocus
                  placeholder="Ex: PRAXIS2026"
                  value={googleCode}
                  onChange={(e) => setGoogleCode(e.target.value)}
                />

                {displayError && (
                  <div role="alert" className="flex items-center gap-2 rounded-md bg-error-bg px-3 py-2 text-sm text-error-foreground">
                    <AlertCircle size={16} className="shrink-0" />
                    {displayError}
                  </div>
                )}

                <Button type="submit" size="lg" disabled={submitting} className="mt-2">
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </>
          )}

          {step === 'code' && !identity && (
            <>
              <h1 className="mt-8 text-2xl font-bold text-white">Entre com seu código</h1>
              <p className="mt-1 text-sm text-white/50">Peça o código ao seu gestor ou administrador.</p>

              <form onSubmit={handleCodeSubmit} className="mt-6 flex flex-col gap-4">
                <Input
                  label="Seu nome"
                  required
                  value={codeForm.name}
                  onChange={(e) => setCodeForm({ ...codeForm, name: e.target.value })}
                />
                <Input
                  label="E-mail"
                  type="email"
                  required
                  value={codeForm.email}
                  onChange={(e) => setCodeForm({ ...codeForm, email: e.target.value })}
                />
                <Input
                  label="Senha"
                  type="password"
                  required
                  minLength={6}
                  value={codeForm.password}
                  onChange={(e) => setCodeForm({ ...codeForm, password: e.target.value })}
                />
                <Input
                  label="Código da empresa"
                  required
                  placeholder="Ex: PRAXIS2026"
                  value={codeForm.code}
                  onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value })}
                />

                {displayError && (
                  <div role="alert" className="flex items-center gap-2 rounded-md bg-error-bg px-3 py-2 text-sm text-error-foreground">
                    <AlertCircle size={16} className="shrink-0" />
                    {displayError}
                  </div>
                )}

                <Button type="submit" size="lg" disabled={submitting} className="mt-2">
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Entrando...' : 'Entrar'}
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
                    onClick={() => signupWithGoogle('code')}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-white/15 bg-white/[0.03] text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    <GoogleIcon />
                    Continuar com Google
                  </button>
                </>
              )}

              {!isSupabase && (
                <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Código de demonstração</p>
                  <button
                    type="button"
                    onClick={() => setCodeForm({ ...codeForm, code: 'PRAXIS2026' })}
                    className="mt-1 text-sm text-white/60 hover:text-[#6d94fa]"
                  >
                    PRAXIS2026
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      <LoginShowcasePanel />
    </div>
  )
}
