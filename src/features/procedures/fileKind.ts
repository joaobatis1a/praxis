export type FileKind = 'video' | 'image' | 'pdf' | 'other'

export function inferFileKind(name: string | undefined): FileKind {
  const ext = name?.split('.').pop()?.toLowerCase() ?? ''
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video'
  if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  return 'other'
}
