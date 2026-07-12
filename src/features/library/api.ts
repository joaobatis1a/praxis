import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { documents, folderTree as initialTree, type DocType, type DocVersion, type FolderNode, type LibraryDocument } from '../../mocks/library'

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let docs = [...documents]
let tree: FolderNode[] = structuredClone(initialTree)

interface FolderRow {
  id: string
  parent_id: string | null
  name: string
}

interface DocumentRow {
  id: string
  folder_id: string | null
  title: string
  type: DocType
  author: string
  updated_at: string
}

interface VersionRow {
  id: string
  document_id: string
  version: string
  date: string
  author: string
  note: string
}

function buildTree(rows: FolderRow[]): FolderNode[] {
  const byParent = new Map<string | null, FolderRow[]>()
  for (const row of rows) {
    const list = byParent.get(row.parent_id) ?? []
    list.push(row)
    byParent.set(row.parent_id, list)
  }
  function build(parentId: string | null): FolderNode[] {
    return (byParent.get(parentId) ?? []).map((row) => {
      const children = build(row.id)
      return children.length ? { id: row.id, name: row.name, children } : { id: row.id, name: row.name }
    })
  }
  return build(null)
}

async function fetchFavoriteIds(): Promise<Set<string>> {
  const { data, error } = await supabase!.from('library_document_favorites').select('document_id')
  if (error || !data) return new Set()
  return new Set((data as { document_id: string }[]).map((r) => r.document_id))
}

async function fetchDocumentById(id: string): Promise<LibraryDocument> {
  const [{ data: row, error }, { data: versionRows }, favoriteIds] = await Promise.all([
    supabase!.from('library_documents').select('*').eq('id', id).single(),
    supabase!.from('library_document_versions').select('*').eq('document_id', id).order('date', { ascending: false }),
    fetchFavoriteIds(),
  ])
  if (error || !row) throw new Error('Documento não encontrado.')
  const r = row as DocumentRow
  const history: DocVersion[] = ((versionRows as VersionRow[] | null) ?? []).map((v) => ({
    version: v.version,
    date: v.date,
    author: v.author,
    note: v.note,
  }))
  return {
    id: r.id,
    title: r.title,
    type: r.type,
    author: r.author,
    updatedAt: r.updated_at,
    folderId: r.folder_id ?? undefined,
    favorite: favoriteIds.has(r.id),
    history,
  }
}

export async function getFolderTree(): Promise<FolderNode[]> {
  if (isSupabase) {
    const { data, error } = await supabase!.from('library_folders').select('id, parent_id, name').order('name')
    if (error || !data) throw new Error('Não foi possível carregar as pastas.')
    return buildTree(data as FolderRow[])
  }
  return delay(tree)
}

export async function listDocuments(): Promise<LibraryDocument[]> {
  if (isSupabase) {
    const [{ data: docRows, error: docsError }, { data: versionRows, error: versionsError }, favoriteIds] = await Promise.all([
      supabase!.from('library_documents').select('*').order('updated_at', { ascending: false }),
      supabase!.from('library_document_versions').select('*').order('date', { ascending: false }),
      fetchFavoriteIds(),
    ])
    if (docsError || !docRows) throw new Error('Não foi possível carregar os documentos.')
    if (versionsError || !versionRows) throw new Error('Não foi possível carregar o histórico dos documentos.')
    const versionsByDoc = new Map<string, DocVersion[]>()
    for (const row of versionRows as VersionRow[]) {
      const list = versionsByDoc.get(row.document_id) ?? []
      list.push({ version: row.version, date: row.date, author: row.author, note: row.note })
      versionsByDoc.set(row.document_id, list)
    }
    return (docRows as DocumentRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      type: row.type,
      author: row.author,
      updatedAt: row.updated_at,
      folderId: row.folder_id ?? undefined,
      favorite: favoriteIds.has(row.id),
      history: versionsByDoc.get(row.id) ?? [],
    }))
  }
  return delay([...docs])
}

export async function toggleFavorite(id: string): Promise<LibraryDocument> {
  if (isSupabase) {
    const { data: existing } = await supabase!.from('library_document_favorites').select('document_id').eq('document_id', id).maybeSingle()
    if (existing) {
      const { error } = await supabase!.from('library_document_favorites').delete().eq('document_id', id)
      if (error) throw new Error('Não foi possível remover dos favoritos.')
    } else {
      const { error } = await supabase!.from('library_document_favorites').insert({ document_id: id })
      if (error) throw new Error('Não foi possível adicionar aos favoritos.')
    }
    return fetchDocumentById(id)
  }
  docs = docs.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d))
  return delay(docs.find((d) => d.id === id)!)
}

function collectFolderIds(node: { id: string; children?: { id: string }[] }): string[] {
  return [node.id, ...(node.children?.flatMap(collectFolderIds) ?? [])]
}

function findNode(nodes: FolderNode[], id: string): FolderNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.children) {
      const found = findNode(n.children, id)
      if (found) return found
    }
  }
  return null
}

export function getDocumentsInFolder(folderId: string | null, allFolders: FolderNode[], allDocs: LibraryDocument[]) {
  if (!folderId) return allDocs
  const node = allFolders.flatMap((c) => [c, ...(c.children ?? [])]).find((f) => f.id === folderId)
  const ids = node ? collectFolderIds(node) : [folderId]
  return allDocs.filter((d) => d.folderId != null && ids.includes(d.folderId))
}

export function getFolderPath(id: string, allFolders: FolderNode[]): FolderNode[] {
  function search(nodes: FolderNode[], path: FolderNode[]): FolderNode[] | null {
    for (const n of nodes) {
      const nextPath = [...path, n]
      if (n.id === id) return nextPath
      if (n.children) {
        const found = search(n.children, nextPath)
        if (found) return found
      }
    }
    return null
  }
  return search(allFolders, []) ?? []
}

export function getFolderDeleteImpact(id: string, allFolders: FolderNode[], allDocs: LibraryDocument[]) {
  const node = findNode(allFolders, id)
  if (!node) return { folderCount: 0, documentCount: 0 }
  const ids = collectFolderIds(node)
  const folderCount = ids.length - 1
  const documentCount = allDocs.filter((d) => d.folderId != null && ids.includes(d.folderId)).length
  return { folderCount, documentCount }
}

export async function addCategory(name: string): Promise<FolderNode[]> {
  if (isSupabase) {
    const { error } = await supabase!.from('library_folders').insert({ name, parent_id: null })
    if (error) throw new Error('Não foi possível criar a categoria.')
    return getFolderTree()
  }
  tree = [...tree, { id: `cat-${Date.now()}`, name, children: [] }]
  return delay(tree)
}

export async function addFolder(parentId: string, name: string): Promise<FolderNode[]> {
  if (isSupabase) {
    const { error } = await supabase!.from('library_folders').insert({ name, parent_id: parentId })
    if (error) throw new Error('Não foi possível criar a pasta.')
    return getFolderTree()
  }
  const newNode: FolderNode = { id: `fld-${Date.now()}`, name }
  function insert(nodes: FolderNode[]): FolderNode[] {
    return nodes.map((n) =>
      n.id === parentId
        ? { ...n, children: [...(n.children ?? []), newNode] }
        : { ...n, children: n.children ? insert(n.children) : n.children },
    )
  }
  tree = insert(tree)
  return delay(tree)
}

export async function renameFolder(id: string, name: string): Promise<FolderNode[]> {
  if (isSupabase) {
    const { error } = await supabase!.from('library_folders').update({ name }).eq('id', id)
    if (error) throw new Error('Não foi possível renomear a pasta.')
    return getFolderTree()
  }
  function rename(nodes: FolderNode[]): FolderNode[] {
    return nodes.map((n) => (n.id === id ? { ...n, name } : { ...n, children: n.children ? rename(n.children) : n.children }))
  }
  tree = rename(tree)
  return delay(tree)
}

export async function deleteFolder(id: string): Promise<{ tree: FolderNode[]; docs: LibraryDocument[] }> {
  if (isSupabase) {
    const { error } = await supabase!.from('library_folders').delete().eq('id', id)
    if (error) throw new Error('Não foi possível excluir a pasta.')
    const [newTree, newDocs] = await Promise.all([getFolderTree(), listDocuments()])
    return { tree: newTree, docs: newDocs }
  }
  const node = findNode(tree, id)
  const idsToRemove = node ? collectFolderIds(node) : [id]
  docs = docs.filter((d) => d.folderId == null || !idsToRemove.includes(d.folderId))

  function remove(nodes: FolderNode[]): FolderNode[] {
    return nodes.filter((n) => n.id !== id).map((n) => ({ ...n, children: n.children ? remove(n.children) : n.children }))
  }
  tree = remove(tree)
  return delay({ tree, docs })
}

export interface CreateDocumentInput {
  title: string
  type: DocType
  /** omit to create an unfiled document, visible only in "Todos os documentos" */
  folderId?: string | null
  author: string
}

export async function createDocument(input: CreateDocumentInput): Promise<LibraryDocument> {
  if (isSupabase) {
    const { data: doc, error } = await supabase!
      .from('library_documents')
      .insert({ title: input.title, type: input.type, folder_id: input.folderId ?? null, author: input.author })
      .select()
      .single()
    if (error || !doc) throw new Error('Não foi possível criar o documento.')
    const row = doc as DocumentRow
    const { error: versionError } = await supabase!.from('library_document_versions').insert({
      document_id: row.id,
      version: 'v1',
      author: input.author,
      note: 'Documento criado.',
    })
    if (versionError) throw new Error('Não foi possível registrar a versão inicial.')
    return fetchDocumentById(row.id)
  }
  const newDoc: LibraryDocument = {
    id: `doc-${Date.now()}`,
    title: input.title,
    type: input.type,
    folderId: input.folderId ?? undefined,
    author: input.author,
    updatedAt: new Date().toISOString().slice(0, 10),
    favorite: false,
    history: [{ version: 'v1', date: new Date().toISOString().slice(0, 10), author: input.author, note: 'Documento criado.' }],
  }
  docs = [newDoc, ...docs]
  return delay(newDoc)
}

export async function deleteDocument(id: string): Promise<void> {
  if (isSupabase) {
    const { error } = await supabase!.from('library_documents').delete().eq('id', id)
    if (error) throw new Error('Não foi possível remover o documento.')
    return
  }
  docs = docs.filter((d) => d.id !== id)
  return delay(undefined)
}

export interface UpdateDocumentInput {
  title: string
  type: DocType
}

export async function updateDocument(id: string, input: UpdateDocumentInput): Promise<LibraryDocument> {
  if (isSupabase) {
    const { error } = await supabase!
      .from('library_documents')
      .update({ title: input.title, type: input.type, updated_at: new Date().toISOString().slice(0, 10) })
      .eq('id', id)
    if (error) throw new Error('Não foi possível atualizar o documento.')
    return fetchDocumentById(id)
  }
  docs = docs.map((d) => (d.id === id ? { ...d, title: input.title, type: input.type } : d))
  return delay(docs.find((d) => d.id === id)!)
}
