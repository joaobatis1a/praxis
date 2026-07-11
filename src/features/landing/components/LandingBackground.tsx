import { KnowledgeGraph } from './KnowledgeGraph'

export function LandingBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[#050810]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(79,125,249,0.22),transparent)]" />
      <KnowledgeGraph className="opacity-60" />
    </div>
  )
}
