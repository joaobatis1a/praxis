import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '../../../lib/cn'

interface Node {
  x: number
  y: number
  r: number
  label?: string
}

const nodes: Node[] = [
  { x: 12, y: 18, r: 3 },
  { x: 28, y: 8, r: 2 },
  { x: 6, y: 42, r: 2 },
  { x: 22, y: 34, r: 4, label: 'Biblioteca' },
  { x: 40, y: 22, r: 2.5 },
  { x: 38, y: 46, r: 2 },
  { x: 16, y: 62, r: 2.5 },
  { x: 32, y: 66, r: 4, label: 'Procedimentos' },
  { x: 52, y: 58, r: 2 },
  { x: 50, y: 34, r: 4, label: 'Treinamentos' },
  { x: 64, y: 44, r: 2.5 },
  { x: 60, y: 14, r: 2 },
  { x: 74, y: 26, r: 4, label: 'Trilhas' },
  { x: 82, y: 10, r: 2 },
  { x: 88, y: 40, r: 2.5 },
  { x: 78, y: 58, r: 2 },
  { x: 46, y: 82, r: 2 },
  { x: 66, y: 74, r: 2.5 },
]

const edges: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 4],
  [3, 4],
  [3, 5],
  [3, 6],
  [6, 7],
  [5, 7],
  [5, 9],
  [4, 9],
  [7, 8],
  [8, 9],
  [9, 10],
  [9, 11],
  [11, 12],
  [10, 12],
  [12, 13],
  [12, 14],
  [10, 15],
  [14, 15],
  [7, 16],
  [8, 17],
  [15, 17],
]

// edges chosen to carry an animated "pulse of data" — kept sparse to stay uncluttered
const pulseEdges = [2, 6, 9, 13, 16, 20]

export function KnowledgeGraph({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  const reducedMotion = useReducedMotion()

  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={cn('h-full w-full', className)}
      aria-hidden
    >
      <defs>
        <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6d94fa" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#6d94fa" stopOpacity="0" />
        </radialGradient>
      </defs>

      {edges.map(([a, b], i) => {
        const na = nodes[a]
        const nb = nodes[b]
        return (
          <motion.path
            key={`${a}-${b}`}
            id={`graph-edge-${i}`}
            d={`M ${na.x} ${na.y} L ${nb.x} ${nb.y}`}
            fill="none"
            stroke="#4f7df9"
            strokeWidth="0.15"
            strokeOpacity="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView ? { pathLength: 1, opacity: 0.5 } : {}}
            transition={{ duration: 1.2, delay: i * 0.045, ease: 'easeInOut' }}
          />
        )
      })}

      {!reducedMotion &&
        inView &&
        pulseEdges.map((edgeIndex, i) => (
          <circle key={`pulse-${edgeIndex}`} r="0.6" fill="#aec4ff">
            <animateMotion
              dur={`${3.5 + (i % 3)}s`}
              begin={`${i * 0.9}s`}
              repeatCount="indefinite"
              keyPoints="0;1"
              keyTimes="0;1"
            >
              <mpath href={`#graph-edge-${edgeIndex}`} />
            </animateMotion>
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.1;0.85;1"
              dur={`${3.5 + (i % 3)}s`}
              begin={`${i * 0.9}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

      {nodes.map((node, i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
          style={{ transformOrigin: `${node.x}px ${node.y}px` }}
        >
          {node.label && (
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.r * 2.2}
              fill="url(#node-glow)"
              animate={
                reducedMotion
                  ? {}
                  : { opacity: [0.5, 1, 0.5], scale: [1, 1.15, 1] }
              }
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            />
          )}
          <circle
            cx={node.x}
            cy={node.y}
            r={node.r * 0.35}
            fill={node.label ? '#eaf1ff' : '#6d94fa'}
            stroke={node.label ? '#4f7df9' : 'none'}
            strokeWidth={node.label ? 0.3 : 0}
          />
        </motion.g>
      ))}
    </svg>
  )
}
