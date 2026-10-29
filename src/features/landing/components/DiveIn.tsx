import { AnimatePresence, motion, useInView, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { FileSpreadsheet, FileText, Folder, Mail, Mic, Play, Search, Star } from 'lucide-react'
import { useEffect, useState, useRef, type ReactNode } from 'react'
import { cn } from '../../../lib/cn'
import { posters, videos } from '../screens'

// A desktop app window: traffic lights, a title, and whatever is inside.
function Win({ title, icon, tone, className, children }: { title: string; icon: ReactNode; tone: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-white/10 bg-[#161b26] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]', className)}>
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#1c2230] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className={cn('ml-2 flex items-center gap-1.5 text-[11px] font-medium', tone)}>
          {icon}
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}

// One window on the desktop. As the camera pushes forward it grows faster the
// closer it is (`depth`), drifts outward along `dir` and fades as it flies past.
// Only transform and opacity move, so the whole dive stays on the compositor.
// On a phone the windows keep their desktop proportions and are shrunk whole
// (zoom), tilted a little, so they read as a tidy collage around the centre.
function Layer({ p, depth, dir, className, children }: { p: MotionValue<number>; depth: number; dir: [number, number]; className: string; children: ReactNode }) {
  const scale = useTransform(p, [0, 0.8], [1, 1 + depth * 2.6])
  const x = useTransform(p, [0, 0.8], ['0vw', `${dir[0] * depth}vw`])
  const y = useTransform(p, [0, 0.8], ['0vh', `${dir[1] * depth}vh`])
  const opacity = useTransform(p, [0.25, 0.65], [1, 0])
  return (
    <motion.div style={{ scale, x, y, opacity }} className={cn('absolute will-change-transform', className)}>
      {children}
    </motion.div>
  )
}

const toasts = [
  { app: 'WhatsApp', text: 'Diego: ela saiu semana passada 😬', tone: 'bg-[#25d366]' },
  { app: 'Gmail', text: 'Re: Re: Fwd: como fecha o caixa?', tone: 'bg-[#ea4335]' },
  { app: 'WhatsApp', text: 'Igor enviou um áudio · 4:32', tone: 'bg-[#25d366]' },
  { app: 'Drive', text: 'manual_v3_FINAL(3).pdf foi adicionado', tone: 'bg-[#f4b400]' },
  { app: 'WhatsApp', text: 'Beatriz: alguém sabe a senha??', tone: 'bg-[#25d366]' },
]

// Notifications keep piling into the corner while the desktop is in view.
function Toasts({ active, max }: { active: boolean; max: number }) {
  const [count, setCount] = useState(1)
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setCount((c) => (c % (toasts.length + 2)) + 1), 1300)
    return () => clearInterval(t)
  }, [active])
  const shown = toasts.slice(0, Math.min(count, toasts.length)).slice(-max)
  return (
    <div className="flex w-full flex-col gap-2 md:w-72">
      <AnimatePresence initial={false}>
        {shown.map((n) => (
          <motion.div
            key={n.text}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-[#1c2230] p-3 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)]"
          >
            <span className={cn('mt-0.5 h-6 w-6 shrink-0 rounded-md', n.tone)} />
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold text-white/80">{n.app}</span>
              <span className="block text-[12px] text-white/60">{n.text}</span>
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// The new hire's desktop, buried in windows. Scrolling pushes the camera through
// them, with depth of field, into the Praxis window at the centre until it
// fills the screen. The stage holds briefly while the dive plays.
export function DiveIn() {
  const ref = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const inView = useInView(ref)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useEffect(() => {
    if (inView) video.current?.play().catch(() => {})
    else video.current?.pause()
  }, [inView])
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 })
  const small = typeof window !== 'undefined' && window.innerWidth < 768
  const scale = useTransform(p, [0, 0.85], [small ? 0.62 : 0.36, 1])
  const chrome = useTransform(p, [0.55, 0.85], [1, 0])
  const wallpaper = useTransform(p, [0.5, 0.85], [1, 0])
  const caption = useTransform(p, [0.84, 0.96], [0, 1])
  const captionY = useTransform(p, [0.84, 0.96], [30, 0])

  return (
    <div ref={ref} id="como-comecar" className="relative h-[280vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#06080d]">
        <motion.div
          style={{ opacity: wallpaper }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_30%_20%,rgba(37,99,235,0.28),transparent),radial-gradient(ellipse_60%_60%_at_85%_90%,rgba(124,58,237,0.22),transparent),#0a0d16]"
        />

        <Layer p={p} depth={0.6} dir={[-55, -30]} className="left-[3%] top-[8%] w-[27vw] min-w-[240px] max-md:top-[22%] max-md:w-[203px] max-md:min-w-0">
          <Win className="max-md:[zoom:0.7] max-md:w-[290px] max-md:-rotate-2" title="WhatsApp · Equipe Suporte" tone="text-[#25d366]" icon={<span className="h-2 w-2 rounded-full bg-[#25d366]" />}>
            <div className="space-y-2 bg-[#0b141a] p-3 text-[12px] leading-snug">
              <p className="ml-auto w-fit max-w-[85%] rounded-lg bg-[#005c4b] px-2.5 py-1.5 text-white/90">primeiro dia aqui 👋 como abro um chamado?</p>
              <p className="w-fit max-w-[85%] rounded-lg bg-[#202c33] px-2.5 py-1.5 text-white/85">pergunta pra Carla</p>
              <p className="w-fit max-w-[85%] rounded-lg bg-[#202c33] px-2.5 py-1.5 text-white/85">ah, ela saiu semana passada 😬</p>
              <p className="flex w-fit items-center gap-2 rounded-lg bg-[#202c33] px-2.5 py-1.5 text-white/70">
                <Play size={11} />
                <span className="flex h-3 items-end gap-[2px]">
                  {[4, 8, 11, 6, 9, 12, 5, 10, 7].map((h, i) => (
                    <span key={i} className="w-[2px] rounded bg-white/50" style={{ height: h }} />
                  ))}
                </span>
                <Mic size={10} /> 4:32
              </p>
            </div>
          </Win>
        </Layer>

        <Layer p={p} depth={0.35} dir={[-40, 50]} className="bottom-[9%] left-[6%] w-[24vw] min-w-[220px] max-md:bottom-auto max-md:left-auto max-md:right-[3%] max-md:top-[27.5%] max-md:w-[175px] max-md:min-w-0">
          <Win className="max-md:[zoom:0.7] max-md:w-[250px] max-md:rotate-3" title="Drive · Pasta Novo (2)" tone="text-[#f4b400]" icon={<Folder size={11} />}>
            <div className="grid grid-cols-3 gap-2 p-3">
              {['manual_v3_FINAL', 'manual_v3_FINAL(2)', 'processos_2019', 'Cópia de Cópia', 'senhas_NAO_ABRIR', 'novo doc (4)'].map((f, i) => (
                <div key={f} className="rounded-lg bg-white/[0.04] p-2 text-center">
                  {i === 2 ? <FileSpreadsheet size={20} className="mx-auto text-[#22c55e]" /> : <FileText size={20} className="mx-auto text-[#ef4444]" />}
                  <p className="mt-1 text-[9px] leading-tight text-white/55 [overflow-wrap:anywhere]">{f}</p>
                </div>
              ))}
            </div>
          </Win>
        </Layer>

        <Layer p={p} depth={0.8} dir={[50, -45]} className="right-[4%] top-[6%] w-[26vw] min-w-[240px] max-md:right-[3%] max-md:top-[77%] max-md:w-[210px] max-md:min-w-0">
          <Win className="max-md:[zoom:0.7] max-md:w-[300px] max-md:rotate-2" title="Gmail · Caixa de entrada (214)" tone="text-[#ea4335]" icon={<Mail size={11} />}>
            <div className="divide-y divide-white/[0.05] text-[11px]">
              {[
                ['Marcos', 'Re: Re: Fwd: como fecha o caixa?'],
                ['RH', 'Fwd: manual atualizado (acho)'],
                ['Diego', 'senha do sistema???'],
                ['TI', 'Re: acesso ao sistema antigo'],
              ].map(([who, subject]) => (
                <p key={subject} className="flex items-center gap-2 px-3 py-2">
                  <Star size={11} className="shrink-0 text-white/25" />
                  <b className="w-12 shrink-0 font-semibold text-white/80">{who}</b>
                  <span className="text-white/55">{subject}</span>
                </p>
              ))}
            </div>
          </Win>
        </Layer>

        <Layer p={p} depth={0.45} dir={[45, 45]} className="bottom-[10%] right-[5%] w-[24vw] min-w-[220px] max-md:bottom-auto max-md:left-[3%] max-md:right-auto max-md:top-[68.5%] max-md:w-[182px] max-md:min-w-0">
          <Win className="max-md:[zoom:0.7] max-md:w-[260px] max-md:-rotate-3" title="processos_2019.xlsx" tone="text-[#22c55e]" icon={<FileSpreadsheet size={11} />}>
            <div className="grid grid-cols-4 gap-px bg-white/[0.06] text-[10px] text-white/55">
              {['Etapa', 'Quem', 'Prazo', 'Obs', '1', 'Carla', '?', 'ver c/ Carla', '2', '???', '—', 'mudou?', '3', 'Marcos', 'sexta', 'saiu'].map((c, i) => (
                <span key={i} className={cn('bg-[#161b26] px-2 py-1.5', i < 4 && 'font-semibold text-white/75')}>
                  {c}
                </span>
              ))}
            </div>
          </Win>
        </Layer>

        <Layer p={p} depth={1.1} dir={[0, -60]} className="left-[38%] top-[3%] w-[24vw] min-w-[220px] max-md:left-[9%] max-md:top-[60%] max-md:w-[82vw] max-md:min-w-0">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#1c2230]/95 px-4 py-2.5 text-[12px] text-white/50 shadow-xl">
            <Search size={13} /> onde está o manual de abertura de chamado
          </div>
        </Layer>

        <Layer p={p} depth={1.3} dir={[40, -20]} className="right-[3%] top-[38%] max-md:inset-x-[5%] max-md:top-[2.5%] max-md:[zoom:0.85]">
          <Toasts active={inView} max={small ? 2 : 3} />
        </Layer>

        {/* the Praxis window the camera dives into */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div style={{ scale }} className="relative z-10 h-[62.5vw] w-screen overflow-hidden rounded-[24px] will-change-transform md:h-screen md:rounded-[40px] bg-[#0b1220] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_80px_160px_-40px_rgba(37,99,235,0.6)]">
            <motion.div style={{ opacity: chrome }} className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 border-b border-white/[0.06] bg-[#1c2230] px-3 py-2 md:gap-3 md:px-6 md:py-4">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] md:h-4 md:w-4" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] md:h-4 md:w-4" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] md:h-4 md:w-4" />
              <span className="ml-4 text-sm font-medium text-white/60 md:text-2xl">app.praxis.com</span>
            </motion.div>
            <video ref={video} src={videos.tour} poster={posters.tour} muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
            <motion.div style={{ opacity: caption, y: captionY }} className="absolute inset-x-0 bottom-4 z-20 px-3 text-center md:bottom-12">
              <p className="mx-auto w-fit rounded-2xl bg-[#0b0d12]/90 px-4 py-2 font-display text-sm font-bold md:rounded-full md:px-6 md:py-3 md:text-2xl tracking-[-0.02em] text-white">
                Tudo num lugar só. <span className="text-[#6d94fa]">Sem ninguém precisar explicar.</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
