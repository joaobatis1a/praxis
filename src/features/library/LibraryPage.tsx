import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FolderPlus, Plus, Search } from 'lucide-react'
import type { FolderNode, LibraryDocument } from '../../mocks/library'
import { Button, ConfirmDialog, Skeleton, useToast } from '../../components/ui'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import {
  addCategory,
  addFolder,
  createDocument,
  deleteDocument,
  deleteFolder,
  getDocumentsInFolder,
  getFolderDeleteImpact,
  getFolderPath,
  getFolderTree,
  listDocuments,
  renameFolder,
  toggleFavorite,
  updateDocument,
} from './api'
import { FolderTree } from './components/FolderTree'
import { FolderBreadcrumb } from './components/FolderBreadcrumb'
import { FolderFormModal } from './components/FolderFormModal'
import { DocumentCard } from './components/DocumentCard'
import { HorizontalDocRow } from './components/HorizontalDocRow'
import { DocumentDetailModal } from './components/DocumentDetailModal'
import { DocumentFormModal, type DocumentFormValues } from './components/DocumentFormModal'

type DocFormState = { mode: 'create' } | { mode: 'edit'; doc: LibraryDocument } | null

export function LibraryPage() {
  const { toast } = useToast()
  const [docs, setDocs] = useState<LibraryDocument[]>([])
  const [tree, setTree] = useState<FolderNode[]>(getFolderTree())
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [openDoc, setOpenDoc] = useState<LibraryDocument | null>(null)
  const [docForm, setDocForm] = useState<DocFormState>(null)
  const [folderFormOpen, setFolderFormOpen] = useState(false)
  const [deletingDoc, setDeletingDoc] = useState<LibraryDocument | null>(null)
  const [deletingFolder, setDeletingFolder] = useState<{ id: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listDocuments().then((data) => {
      setDocs(data)
      setLoading(false)
    })
  }, [])

  const favorites = docs.filter((d) => d.favorite)
  const recent = [...docs].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 6)

  const visibleDocs = useMemo(() => {
    let base = selectedFolder ? getDocumentsInFolder(selectedFolder, tree) : docs
    if (search.trim()) {
      base = base.filter((d) => d.title.toLowerCase().includes(search.toLowerCase()))
    }
    return base
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs, selectedFolder, search])

  async function handleToggleFavorite(id: string) {
    const updated = await toggleFavorite(id)
    setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    setOpenDoc((prev) => (prev && prev.id === updated.id ? updated : prev))
    toast(updated.favorite ? `${updated.title} adicionado aos favoritos.` : `${updated.title} removido dos favoritos.`)
  }

  async function handleDocFormSubmit(values: DocumentFormValues) {
    if (docForm?.mode === 'edit') {
      const updated = await updateDocument(docForm.doc.id, values)
      setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
      setOpenDoc((prev) => (prev && prev.id === updated.id ? updated : prev))
      toast(`${updated.title} foi atualizado.`)
    } else {
      const newDoc = await createDocument({ ...values, folderId: selectedFolder, author: 'Você' })
      setDocs((prev) => [newDoc, ...prev])
      toast(`${newDoc.title} foi criado.`)
    }
  }

  async function handleDeleteDocument() {
    if (!deletingDoc) return
    await deleteDocument(deletingDoc.id)
    setDocs((prev) => prev.filter((d) => d.id !== deletingDoc.id))
    setOpenDoc(null)
    toast(`${deletingDoc.title} foi excluído.`, 'error')
  }

  async function handleFolderFormSubmit(name: string) {
    const updated = selectedFolder ? await addFolder(selectedFolder, name) : await addCategory(name)
    setTree(updated)
    toast(`Pasta "${name}" criada.`)
  }

  async function handleAddCategory(name: string) {
    const updated = await addCategory(name)
    setTree(updated)
    toast(`Categoria "${name}" criada.`)
  }

  async function handleAddFolder(parentId: string, name: string) {
    const updated = await addFolder(parentId, name)
    setTree(updated)
    toast(`Pasta "${name}" criada.`)
  }

  async function handleRenameFolder(id: string, name: string) {
    const updated = await renameFolder(id, name)
    setTree(updated)
    toast(`Pasta renomeada para "${name}".`)
  }

  async function handleDeleteFolder() {
    if (!deletingFolder) return
    const { tree: updatedTree, docs: updatedDocs } = await deleteFolder(deletingFolder.id)
    setTree(updatedTree)
    setDocs(updatedDocs)
    if (selectedFolder === deletingFolder.id) setSelectedFolder(null)
    toast(`"${deletingFolder.name}" foi excluída.`, 'error')
  }

  const impact = deletingFolder ? getFolderDeleteImpact(deletingFolder.id) : null
  const breadcrumbPath = selectedFolder ? getFolderPath(selectedFolder) : []
  const locationLabel = breadcrumbPath.length ? breadcrumbPath.map((n) => n.name).join(' > ') : 'Biblioteca (raiz)'

  return (
    <div className="flex h-full">
      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-border p-4 lg:block">
        <FolderTree
          nodes={tree}
          selectedId={selectedFolder}
          onSelect={setSelectedFolder}
          onAddCategory={handleAddCategory}
          onAddFolder={handleAddFolder}
          onRenameFolder={handleRenameFolder}
          onRequestDelete={(id, name) => setDeletingFolder({ id, name })}
        />
      </aside>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Biblioteca de Conhecimento</h1>
            <p className="mt-1 text-sm text-text-muted">{docs.length} documentos disponíveis</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setFolderFormOpen(true)}>
              <FolderPlus size={16} />
              Nova pasta
            </Button>
            <Button onClick={() => setDocForm({ mode: 'create' })}>
              <Plus size={16} />
              Novo documento
            </Button>
          </div>
        </div>

        {breadcrumbPath.length > 0 && (
          <div className="mt-4">
            <FolderBreadcrumb path={breadcrumbPath} onNavigate={setSelectedFolder} />
          </div>
        )}

        <div className="relative mt-6 max-w-xl">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar documentos..."
            className="h-12 w-full rounded-lg border border-border bg-surface-card pl-11 pr-4 text-sm text-text-primary shadow-[var(--shadow-level-1)] placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
          />
        </div>

        {!search && !selectedFolder && (
          <div className="mt-8 space-y-8">
            <HorizontalDocRow title="Favoritos" documents={favorites} onOpen={setOpenDoc} />
            <HorizontalDocRow title="Documentos recentes" documents={recent} onOpen={setOpenDoc} />
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-text-primary">
            {selectedFolder
              ? breadcrumbPath[breadcrumbPath.length - 1]?.name
              : search
                ? 'Resultados da busca'
                : 'Todos os documentos'}
          </h2>
          {loading ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-36" />
              ))}
            </div>
          ) : visibleDocs.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-sm text-text-muted"
            >
              Nenhum documento encontrado.
            </motion.p>
          ) : (
            <motion.div
              key={selectedFolder ?? search ?? 'all'}
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {visibleDocs.map((doc) => (
                  <motion.div key={doc.id} variants={staggerItem} exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }} layout>
                    <DocumentCard
                      document={doc}
                      onOpen={() => setOpenDoc(doc)}
                      onToggleFavorite={() => handleToggleFavorite(doc.id)}
                      onEdit={() => setDocForm({ mode: 'edit', doc })}
                      onDelete={() => setDeletingDoc(doc)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      <DocumentDetailModal
        document={openDoc}
        onClose={() => setOpenDoc(null)}
        onToggleFavorite={handleToggleFavorite}
        onEdit={() => openDoc && setDocForm({ mode: 'edit', doc: openDoc })}
        onDelete={() => setDeletingDoc(openDoc)}
      />

      <DocumentFormModal
        open={!!docForm}
        onClose={() => setDocForm(null)}
        onSubmit={handleDocFormSubmit}
        folderLabel={locationLabel}
        initialData={docForm?.mode === 'edit' ? { title: docForm.doc.title, type: docForm.doc.type } : undefined}
      />

      <FolderFormModal
        open={folderFormOpen}
        onClose={() => setFolderFormOpen(false)}
        onSubmit={handleFolderFormSubmit}
        locationLabel={locationLabel}
      />

      <ConfirmDialog
        open={!!deletingDoc}
        onClose={() => setDeletingDoc(null)}
        onConfirm={handleDeleteDocument}
        title="Excluir documento"
        description={`Tem certeza que deseja excluir "${deletingDoc?.title}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
      />

      <ConfirmDialog
        open={!!deletingFolder}
        onClose={() => setDeletingFolder(null)}
        onConfirm={handleDeleteFolder}
        title={`Excluir "${deletingFolder?.name}"?`}
        description={
          impact && (impact.folderCount > 0 || impact.documentCount > 0)
            ? `Esta pasta contém ${impact.documentCount} documento(s) e ${impact.folderCount} subpasta(s). Tudo será excluído junto. Essa ação não pode ser desfeita.`
            : 'Essa ação não pode ser desfeita.'
        }
        confirmLabel="Excluir"
      />
    </div>
  )
}
