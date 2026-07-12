import { documents, folderTree as initialTree, type DocType, type FolderNode, type LibraryDocument } from '../../mocks/library'

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

let docs = [...documents]
let tree: FolderNode[] = structuredClone(initialTree)

export function getFolderTree() {
  return tree
}

export function listDocuments() {
  return delay([...docs])
}

export function toggleFavorite(id: string) {
  docs = docs.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d))
  return delay(docs.find((d) => d.id === id)!)
}

function collectFolderIds(node: { id: string; children?: { id: string }[] }): string[] {
  return [node.id, ...(node.children?.flatMap(collectFolderIds) ?? [])]
}

export function getDocumentsInFolder(folderId: string | null, allFolders: FolderNode[]) {
  if (!folderId) return docs
  const node = allFolders.flatMap((c) => [c, ...(c.children ?? [])]).find((f) => f.id === folderId)
  const ids = node ? collectFolderIds(node) : [folderId]
  return docs.filter((d) => d.folderId != null && ids.includes(d.folderId))
}

export function addCategory(name: string) {
  tree = [...tree, { id: `cat-${Date.now()}`, name, children: [] }]
  return delay(tree)
}

export function addFolder(parentId: string, name: string) {
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

export function renameFolder(id: string, name: string) {
  function rename(nodes: FolderNode[]): FolderNode[] {
    return nodes.map((n) => (n.id === id ? { ...n, name } : { ...n, children: n.children ? rename(n.children) : n.children }))
  }
  tree = rename(tree)
  return delay(tree)
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

export function getFolderPath(id: string): FolderNode[] {
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
  return search(tree, []) ?? []
}

export function getFolderDeleteImpact(id: string) {
  const node = findNode(tree, id)
  if (!node) return { folderCount: 0, documentCount: 0 }
  const ids = collectFolderIds(node)
  const folderCount = ids.length - 1
  const documentCount = docs.filter((d) => d.folderId != null && ids.includes(d.folderId)).length
  return { folderCount, documentCount }
}

export function deleteFolder(id: string) {
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

export function createDocument(input: CreateDocumentInput) {
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

export function deleteDocument(id: string) {
  docs = docs.filter((d) => d.id !== id)
  return delay(undefined)
}

export interface UpdateDocumentInput {
  title: string
  type: DocType
}

export function updateDocument(id: string, input: UpdateDocumentInput) {
  docs = docs.map((d) => (d.id === id ? { ...d, title: input.title, type: input.type } : d))
  return delay(docs.find((d) => d.id === id)!)
}
