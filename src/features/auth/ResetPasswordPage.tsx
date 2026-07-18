import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button, Input, Logo, useToast } from '../../components/ui'
import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { KnowledgeGraph } from '../landing/components/KnowledgeGraph'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabase) return
    supabase!.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
    const { data: subscription } = supabase!.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    setSubmitting(true)
    try {
      const { error: updateError } = await supabase!.auth.updateUser({ password })
      if (updateError) throw new Error(updateError.message)
      await supabase!.auth.signOut()
      toast('Senha redefinida. Faça login com sua nova senha.')
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível redefinir sua senha.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dark relative flex h-dvh overflow-hidden bg-[#050810]">
      <Link
        to="/login"
        className="absolute left-6 top-6 z-20 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        Voltar para o login
      </Link>

      <div className="relative flex h-full w-full flex-col justify-center overflow-y-auto px-6 py-12 sm:px-12">
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

          {!isSupabase ? (
            <p className="mt-8 text-sm text-white/50">Redefinição de senha disponível apenas na versão real do Praxis.</p>
          ) : !ready ? (
            <p className="mt-8 text-sm text-white/50">Confirmando seu link de recuperação...</p>
          ) : (
            <>
              <h1 className="mt-8 text-2xl font-bold text-white">Crie uma nova senha</h1>
              <p className="mt-1 text-sm text-white/50">Escolha uma nova senha para sua conta.</p>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <Input
                  label="Nova senha"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoFocus
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
                <Input
                  label="Confirmar nova senha"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && (
                  <div role="alert" className="flex items-center gap-2 rounded-md bg-error-bg px-3 py-2 text-sm text-error-foreground">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" disabled={submitting} className="mt-2">
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Salvando...' : 'Salvar nova senha'}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
