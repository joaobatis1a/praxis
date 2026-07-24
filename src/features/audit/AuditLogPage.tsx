import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ClipboardList, History, Megaphone, Users, type LucideIcon } from 'lucide-react'
import { Button, Select, Skeleton } from '../../components/ui'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import type { AuditEntityType, AuditLogEntry } from './api'
import { listAuditLog } from './api'

const iconByEntity: Record<AuditEntityType, LucideIcon> = {
  procedure: ClipboardList,
  document: BookOpen,
  notice: Megaphone,
  user: Users,
}

const entityNoun: Record<AuditEntityType, string> = {
  procedure: 'o procedimento',
  document: 'o documento',
  notice: 'o aviso',
  user: '',
}

const actionVerb: Record<AuditLogEntry['action'], string> = {
  created: 'criou',
  updated: 'atualizou',
  published: 'publicou',
  deleted: 'excluiu',
  role_changed: 'mudou o cargo de',
  department_changed: 'mudou o departamento de',
  deactivated: 'desativou',
  reactivated: 'reativou',
}

const roleLabel: Record<string, string> = {
  admin: 'Proprietário',
  gestor: 'Gestor',
  colaborador: 'Colaborador',
}

function describeEntry(entry: AuditLogEntry): string {
  const verb = actionVerb[entry.action]
  if (entry.entityType === 'user') {
    const base = `${verb} ${entry.entityLabel}`
    if (entry.metadata?.from && entry.metadata?.to) {
      const isRole = entry.action === 'role_changed'
      const from = isRole ? roleLabel[entry.metadata.from] ?? entry.metadata.from : entry.metadata.from
      const to = isRole ? roleLabel[entry.metadata.to] ?? entry.metadata.to : entry.metadata.to
      return `${base} (${from} → ${to})`
    }
    return base
  }
  return `${verb} ${entityNoun[entry.entityType]} "${entry.entityLabel}"`
}

const filterOptions = [
  { value: 'todos', label: 'Todos os tipos' },
  { value: 'procedure', label: 'Procedimentos' },
  { value: 'document', label: 'Documentos' },
  { value: 'notice', label: 'Avisos' },
  { value: 'user', label: 'Usuários' },
]

export function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [entityFilter, setEntityFilter] = useState('todos')
  const [search, setSearch] = useState('')

  useEffect(() => {
    listAuditLog(0).then(({ entries: page, hasMore: more }) => {
      setEntries(page)
      setHasMore(more)
      setLoading(false)
    })
  }, [])

  async function handleLoadMore() {
    setLoadingMore(true)
    const { entries: page, hasMore: more } = await listAuditLog(entries.length)
    setEntries((prev) => [...prev, ...page])
    setHasMore(more)
    setLoadingMore(false)
  }

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (entityFilter !== 'todos' && e.entityType !== entityFilter) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        if (!e.actorName.toLowerCase().includes(q) && !e.entityLabel.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [entries, entityFilter, search])

  return (
    <div className="mx-auto max-w-[900px] p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary">Atividade</h1>
        <p className="mt-1 text-sm text-text-muted">Quem mudou o quê e quando, na sua empresa.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-6 flex flex-wrap gap-3"
      >
        <Select value={entityFilter} onChange={setEntityFilter} options={filterOptions} triggerClassName="w-48" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por pessoa ou item..."
          className="h-10 flex-1 min-w-[200px] rounded-md border border-border bg-surface-card px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
      </motion.div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 py-16 text-center">
            <History size={28} className="text-text-muted" />
            <p className="text-sm text-text-muted">Nenhuma atividade encontrada.</p>
          </motion.div>
        ) : (
          <motion.ul variants={staggerContainer} initial="hidden" animate="show" className="space-y-1">
            {filtered.map((entry) => {
              const Icon = iconByEntity[entry.entityType]
              return (
                <motion.li
                  key={entry.id}
                  variants={staggerItem}
                  layout
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                  className="group flex items-start gap-3 rounded-md p-2.5 transition-colors hover:bg-surface-hover"
                >
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: -6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-text-secondary transition-colors group-hover:bg-primary/15 group-hover:text-primary"
                  >
                    <Icon size={15} />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-secondary">
                      <span className="font-medium text-text-primary">{entry.actorName}</span> {describeEntry(entry)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-text-muted">{entry.time}</span>
                </motion.li>
              )
            })}
          </motion.ul>
        )}

        {!loading && hasMore && (
          <div className="mt-4 flex justify-center">
            <Button variant="secondary" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? 'Carregando...' : 'Carregar mais'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
