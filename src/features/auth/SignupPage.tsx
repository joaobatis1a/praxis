import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button, Input, Logo } from '../../components/ui'
import { isSupabase } from '../../lib/dataSource'
import { useAuth } from './AuthContext'
import { finishGoogleCodeSignup, signupMaintenanceRequest, signupWithCodeRequest, signupWithGoogle } from './api'
import { LoginShowcasePanel } from './components/LoginShowcasePanel'
import { KnowledgeGraph } from '../landing/components/KnowledgeGraph'
import { GoogleIcon } from './components/GoogleIcon'
import { isPasswordValid, PasswordRequirements } from './components/PasswordRequirements'
import { redeemMaintenanceInviteCode } from '../maintenance/api'

// 'code'/'code-details' and the maintenance-* steps are the only ones reachable: this whole
// component only renders past the demo guard below when isSupabase is true, and company creation
// there is sales-led (see createCompanyForClient in features/maintenance/api.ts), never self-service.
type Step = 'code' | 'code-details' | 'maintenance-code' | 'maintenance-details'

const initialOauthIntent = new URLSearchParams(window.location.search).get('oauthIntent')
const initialStep: Step = initialOauthIntent === 'maintenance' ? 'maintenance-code' : 'code'

function PasswordToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={shown ? 'Ocultar senha' : 'Mostrar senha'}
      className="rounded-sm p-1.5 text-white/40 hover:text-white"
    >
      {shown ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )
}

/** LGPD consent — required before any of the account-creation submits below go through. */
function TermsCheckbox({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-start gap-2 text-xs text-white/50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-primary"
      />
      <span>
        Li e aceito os{' '}
        <Link to="/termos" target="_blank" className="text-[#6d94fa] hover:underline">
          Termos de Uso
        </Link>{' '}
        e a{' '}
        <Link to="/privacidade" target="_blank" className="text-[#6d94fa] hover:underline">
          Política de Privacidade
        </Link>
        .
      </span>
    </label>
  )
}

export function SignupPage() {
  const [step, setStep] = useState<Step>(initialStep)
  const {
    setSessionUser,
    user,
    error: authError,
    pendingGoogleUser,
    clearPendingGoogleUser,
    noCompanySession,
    clearNoCompanySession,
    maintenanceNoCompany,
    refreshMaintenanceStatus,
  } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [aceiteTermos, setAceiteTermos] = useState(false)

  const [codeForm, setCodeForm] = useState({ name: '', email: '', password: '', code: '' })
  const [codeConfirmPassword, setCodeConfirmPassword] = useState('')
  const [googleCode, setGoogleCode] = useState('')
  const [maintenanceForm, setMaintenanceForm] = useState({ email: '', password: '', code: '' })
  const [maintenanceConfirmPassword, setMaintenanceConfirmPassword] = useState('')

  const displayError = error || authError
  // pendingGoogleUser (fresh Google signup) and noCompanySession (logged in, no company —
  // e.g. after "Sair da empresa") both finish the same way: pick "Criar empresa" or "Tenho um
  // código" for an *existing* Supabase Auth user, no new account created.
  const identity = pendingGoogleUser ?? noCompanySession

  // covers the Google OAuth redirect-back landing here with a session (and profile) already set,
  // and a maintenance account arriving here with no company (routed to the maintenance panel instead)
  useEffect(() => {
    if (user) navigate('/dashboard')
    else if (maintenanceNoCompany) navigate('/manutencao')
  }, [user, maintenanceNoCompany, navigate])

  function goBack() {
    setError(null)
    setAceiteTermos(false)
    if (step === 'code-details') {
      setStep('code')
      return
    }
    if (step === 'maintenance-details') {
      setStep('maintenance-code')
      return
    }
    if (step === 'maintenance-code') {
      setStep('code')
      return
    }
    if (pendingGoogleUser) clearPendingGoogleUser()
    if (noCompanySession) clearNoCompanySession()
    window.history.replaceState({}, '', '/signup')
    setStep('code')
  }

  function handleCodeNext(e: FormEvent) {
    e.preventDefault()
    if (!codeForm.code.trim()) return
    setError(null)
    setStep('code-details')
  }

  function handleMaintenanceCodeNext(e: FormEvent) {
    e.preventDefault()
    if (!maintenanceForm.code.trim()) return
    setError(null)
    setStep('maintenance-details')
  }

  async function handleCodeSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!isPasswordValid(codeForm.password)) {
      setError('A senha não atende aos requisitos mínimos.')
      return
    }
    if (codeForm.password !== codeConfirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (!aceiteTermos) {
      setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade.')
      return
    }
    setSubmitting(true)
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

  async function handleFinishGoogleCode(e: FormEvent) {
    e.preventDefault()
    if (!identity) return
    if (!aceiteTermos) {
      setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade.')
      return
    }
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

  /** identity already has a real Auth account (just no company profile) — redeem directly, no
   * account creation needed. */
  async function handleRedeemMaintenanceIdentity(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const ok = await redeemMaintenanceInviteCode(maintenanceForm.code)
      if (!ok) {
        setError('Código inválido ou já usado.')
        return
      }
      await refreshMaintenanceStatus()
      window.history.replaceState({}, '', '/signup')
      navigate('/manutencao')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível resgatar o código.')
    } finally {
      setSubmitting(false)
    }
  }

  /** No identity at all — creates a bare account and redeems in one step, then a full reload so
   * AuthContext discovers the fresh session naturally (mirrors how a normal page load resolves
   * noCompanySession → maintenanceNoCompany, avoiding any manual AuthContext state surgery). */
  async function handleMaintenanceSignup(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!isPasswordValid(maintenanceForm.password)) {
      setError('A senha não atende aos requisitos mínimos.')
      return
    }
    if (maintenanceForm.password !== maintenanceConfirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (!aceiteTermos) {
      setError('Você precisa aceitar os Termos de Uso e a Política de Privacidade.')
      return
    }
    setSubmitting(true)
    try {
      await signupMaintenanceRequest(maintenanceForm)
      window.location.href = '/manutencao'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar sua conta.')
      setSubmitting(false)
    }
  }

  // The demo (mock) deployment is meant to be explored with the pre-seeded demo accounts shown
  // on /login, not by letting anyone self-serve a real company here — block the whole flow with
  // a clear notice instead of the signup form. The real (Supabase) deployment is sales-led for
  // new companies but still self-service for joining one with a code, so it's unaffected.
  if (!isSupabase) {
    return (
      <div className="dark relative flex h-dvh items-center justify-center overflow-hidden bg-[#050810] px-6">
        <div className="absolute inset-0 z-0 opacity-50">
          <KnowledgeGraph />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#050810] via-[#050810]/40 to-[#050810]/70" />

        <Link
          to="/"
          className="absolute left-6 top-6 z-20 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 mx-auto w-full max-w-sm text-center"
        >
          <Link to="/" className="inline-flex">
            <Logo textClassName="text-white" />
          </Link>
          <h1 className="mt-8 text-2xl font-bold text-white">Não é possível na demonstração</h1>
          <p className="mt-2 text-sm text-white/50">
            Esta é uma demonstração do Praxis — a criação de contas está desativada. Entre com uma das contas de
            demonstração para explorar o produto.
          </p>
          <Button size="lg" className="mt-8" onClick={() => navigate('/login')}>
            Ir para o login
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="dark relative flex h-dvh overflow-hidden bg-[#050810]">
      <button
        type="button"
        onClick={() => {
          // step === 'code' is only the true root when there's no identity yet — with an
          // identity (post-Google-login) it's one step further in, and needs goBack() to
          // actually sign out so a re-attempt doesn't silently resume the same account
          const isRootStep = step === 'code' && !identity
          if (isRootStep) navigate('/')
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

                <TermsCheckbox checked={aceiteTermos} onChange={setAceiteTermos} />

                {displayError && (
                  <div role="alert" className="flex items-center gap-2 rounded-md bg-error-bg px-3 py-2 text-sm text-error-foreground">
                    <AlertCircle size={16} className="shrink-0" />
                    {displayError}
                  </div>
                )}

                <Button type="submit" size="lg" disabled={submitting || !aceiteTermos} className="mt-2">
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              {isSupabase && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setStep('maintenance-code')
                  }}
                  className="mt-4 text-sm text-white/50 underline decoration-white/20 underline-offset-4 hover:text-white"
                >
                  É um código de manutenção?
                </button>
              )}
            </>
          )}

          {step === 'code' && !identity && (
            <>
              <h1 className="mt-8 text-2xl font-bold text-white">Entre com seu código</h1>
              <p className="mt-1 text-sm text-white/50">Peça o código ao seu gestor ou administrador.</p>

              <form onSubmit={handleCodeNext} className="mt-6 flex flex-col gap-4">
                <Input
                  label="Código da empresa"
                  required
                  autoFocus
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

                <Button type="submit" size="lg" className="mt-2">
                  Próximo
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
                    onClick={() => signupWithGoogle()}
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

              {isSupabase && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setStep('maintenance-code')
                  }}
                  className="mt-6 text-sm text-white/50 underline decoration-white/20 underline-offset-4 hover:text-white"
                >
                  É um código de manutenção?
                </button>
              )}
            </>
          )}

          {step === 'code-details' && !identity && (
            <>
              <h1 className="mt-8 text-2xl font-bold text-white">Seus dados</h1>
              <p className="mt-1 text-sm text-white/50">Código: <span className="text-white/80">{codeForm.code}</span></p>

              <form onSubmit={handleCodeSubmit} className="mt-6 flex flex-col gap-4">
                <Input
                  label="Seu nome"
                  required
                  autoFocus
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
                <div className="flex flex-col gap-1.5">
                  <Input
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={codeForm.password}
                    onChange={(e) => setCodeForm({ ...codeForm, password: e.target.value })}
                    endAdornment={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
                  />
                  <PasswordRequirements password={codeForm.password} />
                </div>
                <Input
                  label="Confirmar senha"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={codeConfirmPassword}
                  onChange={(e) => setCodeConfirmPassword(e.target.value)}
                  endAdornment={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
                />

                <TermsCheckbox checked={aceiteTermos} onChange={setAceiteTermos} />

                {displayError && (
                  <div role="alert" className="flex items-center gap-2 rounded-md bg-error-bg px-3 py-2 text-sm text-error-foreground">
                    <AlertCircle size={16} className="shrink-0" />
                    {displayError}
                  </div>
                )}

                <Button type="submit" size="lg" disabled={submitting || !aceiteTermos} className="mt-2">
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </>
          )}

          {step === 'maintenance-code' && identity && (
            <>
              <h1 className="mt-8 text-2xl font-bold text-white">Código de manutenção</h1>
              <p className="mt-1 text-sm text-white/50">
                Entrando como <span className="text-white/80">{identity.email}</span>.
              </p>

              <form onSubmit={handleRedeemMaintenanceIdentity} className="mt-6 flex flex-col gap-4">
                <Input
                  label="Código"
                  required
                  autoFocus
                  placeholder="Ex: ABCD1234"
                  value={maintenanceForm.code}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, code: e.target.value })}
                />

                {displayError && (
                  <div role="alert" className="flex items-center gap-2 rounded-md bg-error-bg px-3 py-2 text-sm text-error-foreground">
                    <AlertCircle size={16} className="shrink-0" />
                    {displayError}
                  </div>
                )}

                <Button type="submit" size="lg" disabled={submitting} className="mt-2">
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Resgatando...' : 'Resgatar'}
                </Button>
              </form>
            </>
          )}

          {step === 'maintenance-code' && !identity && (
            <>
              <h1 className="mt-8 text-2xl font-bold text-white">Código de manutenção</h1>
              <p className="mt-1 text-sm text-white/50">Ativa o acesso de manutenção.</p>

              <form onSubmit={handleMaintenanceCodeNext} className="mt-6 flex flex-col gap-4">
                <Input
                  label="Código"
                  required
                  autoFocus
                  placeholder="Ex: ABCD1234"
                  value={maintenanceForm.code}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, code: e.target.value })}
                />

                {displayError && (
                  <div role="alert" className="flex items-center gap-2 rounded-md bg-error-bg px-3 py-2 text-sm text-error-foreground">
                    <AlertCircle size={16} className="shrink-0" />
                    {displayError}
                  </div>
                )}

                <Button type="submit" size="lg" className="mt-2">
                  Próximo
                </Button>
              </form>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-white/40">ou</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <button
                type="button"
                onClick={() => signupWithGoogle('maintenance')}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-white/15 bg-white/[0.03] text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                <GoogleIcon />
                Continuar com Google
              </button>
            </>
          )}

          {step === 'maintenance-details' && !identity && (
            <>
              <h1 className="mt-8 text-2xl font-bold text-white">Seus dados</h1>
              <p className="mt-1 text-sm text-white/50">Código: <span className="text-white/80">{maintenanceForm.code}</span></p>

              <form onSubmit={handleMaintenanceSignup} className="mt-6 flex flex-col gap-4">
                <Input
                  label="E-mail"
                  type="email"
                  required
                  autoFocus
                  value={maintenanceForm.email}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, email: e.target.value })}
                />
                <div className="flex flex-col gap-1.5">
                  <Input
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={maintenanceForm.password}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, password: e.target.value })}
                    endAdornment={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
                  />
                  <PasswordRequirements password={maintenanceForm.password} />
                </div>
                <Input
                  label="Confirmar senha"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={maintenanceConfirmPassword}
                  onChange={(e) => setMaintenanceConfirmPassword(e.target.value)}
                  endAdornment={<PasswordToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
                />

                <TermsCheckbox checked={aceiteTermos} onChange={setAceiteTermos} />

                {displayError && (
                  <div role="alert" className="flex items-center gap-2 rounded-md bg-error-bg px-3 py-2 text-sm text-error-foreground">
                    <AlertCircle size={16} className="shrink-0" />
                    {displayError}
                  </div>
                )}

                <Button type="submit" size="lg" disabled={submitting || !aceiteTermos} className="mt-2">
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Criando...' : 'Criar conta'}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>

      <LoginShowcasePanel />
    </div>
  )
}
