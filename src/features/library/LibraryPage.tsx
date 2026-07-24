import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FilePlus, FolderPlus, Plus, Search } from 'lucide-react'
import type { FolderNode, LibraryDocument } from '../../mocks/library'
import { Button, ConfirmDialog, Skeleton, useToast } from '../../components/ui'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'
import { useAuth } from '../auth/AuthContext'
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
import { DocumentGridSection } from './components/DocumentGridSection'
import { DocumentDetailModal } from './components/DocumentDetailModal'
import { DocumentFormModal, inferTypeFromFilename, stripExtension, type DocumentFormValues } from './components/DocumentFormModal'

type DocFormState = { mode: 'create' } | { mode: 'edit'; doc: LibraryDocument } | null

export function LibraryPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [docs, setDocs] = useState<LibraryDocument[]>([])
  const [tree, setTree] = useState<FolderNode[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [openDoc, setOpenDoc] = useState<LibraryDocument | null>(null)
  const [docForm, setDocForm] = useState<DocFormState>(null)
  const [folderFormOpen, setFolderFormOpen] = useState(false)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [deletingDoc, setDeletingDoc] = useState<LibraryDocument | null>(null)
  const [deletingFolder, setDeletingFolder] = useState<{ id: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listDocuments(), getFolderTree()]).then(([docsData, treeData]) => {
      setDocs(docsData)
      setTree(treeData)
      setLoading(false)
    })
  }, [])

  const favorites = docs.filter((d) => d.favorite)
  const recent = [...docs].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 6)

  const visibleDocs = useMemo(() => {
    let base = selectedFolder ? getDocumentsInFolder(selectedFolder, tree, docs) : docs
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
    try {
      if (docForm?.mode === 'edit') {
        const updated = await updateDocument(docForm.doc.id, values)
        setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
        setOpenDoc((prev) => (prev && prev.id === updated.id ? updated : prev))
        toast(`${updated.title} foi atualizado.`)
      } else {
        const newDoc = await createDocument({ ...values, folderId: selectedFolder, author: user?.name ?? 'Você' })
        setDocs((prev) => [newDoc, ...prev])
        toast(`${newDoc.title} foi criado.`)
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível salvar o documento.', 'error')
      throw err
    }
  }

  async function handleDocFormSubmitBatch(files: File[]) {
    try {
      const created: LibraryDocument[] = []
      for (const file of files) {
        const doc = await createDocument({
          title: stripExtension(file.name),
          type: inferTypeFromFilename(file.name),
          folderId: selectedFolder,
          author: user?.name ?? 'Você',
          file,
        })
        created.push(doc)
      }
      setDocs((prev) => [...created, ...prev])
      toast(`${created.length} documentos foram criados.`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível salvar um dos documentos.', 'error')
      throw err
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
    try {
      const updated = selectedFolder ? await addFolder(selectedFolder, name) : await addCategory(name)
      setTree(updated)
      toast(`Pasta "${name}" criada.`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível criar a pasta.', 'error')
      throw err
    }
  }

  async function handleAddCategory(name: string) {
    try {
      const updated = await addCategory(name)
      setTree(updated)
      toast(`Categoria "${name}" criada.`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível criar a categoria.', 'error')
    }
  }

  async function handleAddFolder(parentId: string, name: string) {
    try {
      const updated = await addFolder(parentId, name)
      setTree(updated)
      toast(`Pasta "${name}" criada.`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível criar a pasta.', 'error')
    }
  }

  async function handleRenameFolder(id: string, name: string) {
    try {
      const updated = await renameFolder(id, name)
      setTree(updated)
      toast(`Pasta renomeada para "${name}".`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Não foi possível renomear a pasta.', 'error')
    }
  }

  async function handleDeleteFolder() {
    if (!deletingFolder) return
    const { tree: updatedTree, docs: updatedDocs } = await deleteFolder(deletingFolder.id)
    setTree(updatedTree)
    setDocs(updatedDocs)
    if (selectedFolder === deletingFolder.id) setSelectedFolder(null)
    toast(`"${deletingFolder.name}" foi excluída.`, 'error')
  }

  const impact = deletingFolder ? getFolderDeleteImpact(deletingFolder.id, tree, docs) : null
  const breadcrumbPath = selectedFolder ? getFolderPath(selectedFolder, tree) : []
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
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-text-primary">Biblioteca de Conhecimento</h1>
            <p className="mt-1 text-sm text-text-muted">{docs.length} documentos disponíveis</p>
          </div>
          <div className="relative shrink-0">
            <Button onClick={() => setAddMenuOpen((v) => !v)}>
              <Plus size={16} />
              Novo
            </Button>
            <AnimatePresence>
              {addMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setAddMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.12 } }}
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className="absolute right-0 top-full z-20 mt-2 w-52 rounded-lg border border-border bg-surface-card p-1.5 shadow-[var(--shadow-level-2)]"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setAddMenuOpen(false)
                        setDocForm({ mode: 'create' })
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    >
                      <FilePlus size={16} />
                      Novo documento
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddMenuOpen(false)
                        setFolderFormOpen(true)
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    >
                      <FolderPlus size={16} />
                      Nova pasta
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
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
            <DocumentGridSection
              title="Favoritos"
              documents={favorites}
              onOpen={setOpenDoc}
              onToggleFavorite={handleToggleFavorite}
              onEdit={(doc) => setDocForm({ mode: 'edit', doc })}
              onDelete={setDeletingDoc}
            />
            <DocumentGridSection
              title="Documentos recentes"
              documents={recent}
              onOpen={setOpenDoc}
              onToggleFavorite={handleToggleFavorite}
              onEdit={(doc) => setDocForm({ mode: 'edit', doc })}
              onDelete={setDeletingDoc}
            />
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
        onSubmitBatch={handleDocFormSubmitBatch}
        folderLabel={locationLabel}
        initialData={
          docForm?.mode === 'edit'
            ? {
                title: docForm.doc.title,
                type: docForm.doc.type,
                fileName: docForm.doc.fileName,
                externalLinks: docForm.doc.externalLinks,
              }
            : undefined
        }
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
