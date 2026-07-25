import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Camera, Eye, EyeOff, KeyRound, Save, User as UserIcon } from 'lucide-react'
import { Avatar, Badge, Button, Card, Input, Select, useToast } from '../../components/ui'
import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { getUserDepartment } from '../../lib/userDepartment'
import type { AuthUser, Role } from '../auth/types'
import { useAuth } from '../auth/AuthContext'
import { listDepartments } from '../departments/api'
import { getCompany, removeAvatar, updateProfile, uploadAvatar } from './api'

const roleLabels: Record<Role, string> = {
  admin: 'Proprietário',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
}

function AvatarUploadField({ user, onUpdated }: { user: AuthUser; onUpdated: (avatarUrl: string | null) => void }) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  if (!isSupabase) return <Avatar name={user.name} avatarUrl={user.avatarUrl} size={64} className="text-xl" />

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadAvatar(user.id, file)
      onUpdated(url)
      toast('Foto de perfil atualizada.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível enviar a foto.', 'error')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    setUploading(true)
    try {
      await removeAvatar(user.id)
      onUpdated(null)
      toast('Foto removida.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível remover a foto.', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size={64} className="text-xl" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Alterar foto de perfil"
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface-card bg-primary text-white transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
        >
          <Camera size={12} />
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {user.avatarUrl && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={uploading}
          className="text-xs font-medium text-text-muted transition-colors hover:text-error disabled:pointer-events-none disabled:opacity-60"
        >
          Remover foto
        </button>
      )}
    </div>
  )
}

function PasswordCard() {
  const { toast } = useToast()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!isSupabase) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast('A senha precisa ter pelo menos 6 caracteres.', 'error')
      return
    }
    if (password !== confirmPassword) {
      toast('As senhas não coincidem.', 'error')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase!.auth.updateUser({ password })
      if (error) throw new Error(error.message)
      setPassword('')
      setConfirmPassword('')
      toast('Senha atualizada.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível atualizar a senha.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-6">
      <Card>
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-primary" />
          <h2 className="text-base font-semibold text-text-primary">Segurança</h2>
        </div>
        <p className="mt-1 text-sm text-text-muted">Altere sua senha de acesso.</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nova senha"
              type={showPassword ? 'text' : 'password'}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="rounded-sm p-1.5 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Input
              label="Confirmar nova senha"
              type={showPassword ? 'text' : 'password'}
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="rounded-sm p-1.5 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !password || !confirmPassword}>
              <KeyRound size={16} />
              {saving ? 'Salvando...' : 'Atualizar senha'}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}

export function ProfilePage() {
  const { user, setSessionUser, noCompanySession, isMaintenanceAccount } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [department, setDepartment] = useState(() => getUserDepartment(user) ?? '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [departmentsList, setDepartmentsList] = useState<string[]>([])
  const [companyName, setCompanyName] = useState<string | null>(null)

  useEffect(() => {
    setName(user?.name ?? '')
    setDepartment(getUserDepartment(user) ?? '')
  }, [user])

  useEffect(() => {
    if (user?.role !== 'admin') return
    listDepartments().then(setDepartmentsList)
  }, [user])

  useEffect(() => {
    if (!user) return
    getCompany()
      .then((c) => setCompanyName(c.name))
      .catch(() => {})
  }, [user])

  async function handleSaveProfile() {
    if (!user) return
    setSavingProfile(true)
    try {
      const updated = await updateProfile(user.id, { name: name.trim(), email: user.email, role: user.role, department })
      setSessionUser({ ...user, name: updated.name, department: updated.department })
      toast('Perfil atualizado.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível atualizar o perfil.', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  if (!user && !noCompanySession) return null

  if (!user) {
    // a bare maintenance/support session — no profiles row exists, so there's nothing to edit,
    // just the account identity behind the login
    const displayName = noCompanySession?.name ?? ''
    return (
      <div className="mx-auto max-w-[720px] p-6 lg:p-8">
        <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text-primary">
          Meu perfil
        </motion.h1>
        <p className="mt-1 text-sm text-text-muted">Seus dados pessoais de acesso.</p>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <Card>
            <div className="flex items-center gap-2">
              <UserIcon size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-text-primary">Dados pessoais</h2>
            </div>
            <div className="mt-4 space-y-4">
              {displayName && <Avatar name={displayName} size={56} className="text-lg" />}
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nome" value={displayName} disabled />
                <Input label="E-mail" value={noCompanySession?.email ?? ''} disabled hint="O e-mail não pode ser alterado." />
              </div>
              <Badge variant="primary">{isMaintenanceAccount ? 'Manutenção' : 'Suporte'}</Badge>
            </div>
          </Card>
        </motion.div>

        <PasswordCard />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px] p-6 lg:p-8">
      <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text-primary">
        Meu perfil
      </motion.h1>
      <p className="mt-1 text-sm text-text-muted">Seus dados pessoais de acesso.</p>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
        <Card>
          <div className="flex items-center gap-2">
            <UserIcon size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-text-primary">Dados pessoais</h2>
          </div>
          <div className="mt-4 space-y-4">
            <AvatarUploadField user={user} onUpdated={(avatarUrl) => setSessionUser({ ...user, avatarUrl })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="E-mail" value={user.email} disabled hint="O e-mail não pode ser alterado." />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">{roleLabels[user.role]}</Badge>
              {user.role !== 'admin' && <Badge variant="neutral">{department}</Badge>}
              {companyName && <Badge variant="neutral">{companyName}</Badge>}
            </div>
            {user.role === 'admin' && (
              <div className="flex flex-col gap-1.5 sm:max-w-xs">
                <label className="text-sm font-medium text-text-primary">Departamento</label>
                <Select
                  value={department}
                  onChange={setDepartment}
                  options={departmentsList.map((dept) => ({ value: dept, label: dept }))}
                  className="w-full"
                  triggerClassName="w-full"
                  aria-label="Meu departamento"
                />
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} disabled={savingProfile || !name.trim()}>
                <Save size={16} />
                {savingProfile ? 'Salvando...' : 'Salvar perfil'}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <PasswordCard />
    </div>
  )
}
