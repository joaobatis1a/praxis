import { Construction } from 'lucide-react'

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Construction size={24} />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-text-primary">{title}</h1>
      <p className="mt-1 max-w-sm text-sm text-text-muted">
        Este módulo ainda está em construção e será liberado em breve.
      </p>
    </div>
  )
}
