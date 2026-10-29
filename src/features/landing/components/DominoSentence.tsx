import { useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../../lib/cn'

// "|" marks where the accented (blue) part of a line starts
const front = ['Hoje, o que sua equipe sabe', 'está |espalhado.']
const back = ['No Praxis, cada coisa tem', '|seu lugar.']

// One sentence, each letter its own tile hinged at the baseline. `shown`
// stands the tiles up; otherwise they lie flat, tipped away from the viewer
// (`away`) or toward them. A wave runs left to right across both lines.
function Sentence({ lines, shown, away }: { lines: string[]; shown: boolean; away: boolean }) {
  let n = 0
  return (
    <p aria-hidden className="text-center [grid-area:1/1]">
      {lines.map((line, li) => {
        const at = line.indexOf('|')
        const text = line.replace('|', '')
        let pos = 0
        return (
          <span key={li} className="block">
            {text.split(' ').map((word, wi) => {
              const start = pos
              pos += word.length + 1
              return (
                // words never break inside, but lines may wrap between them on narrow screens
                <span key={wi}>
                  {wi > 0 && ' '}
                  <span className="inline-block whitespace-nowrap">
                    {[...word].map((ch, ci) => {
                      const i = n++
                      const accent = at >= 0 && start + ci >= at
                      return (
                        <span
                          key={ci}
                          className={cn('inline-block [backface-visibility:hidden]', accent ? 'text-[#6d94fa]' : 'text-white')}
                          style={{
                            transformOrigin: '50% 85%',
                            transform: shown ? 'rotateX(0deg)' : `rotateX(${away ? 92 : -92}deg)`,
                            opacity: shown ? 1 : 0,
                            // incoming tiles wait for the outgoing ones in their spot to drop first
                            transition: `transform 900ms cubic-bezier(.68,-0.45,.27,1.45) ${i * 32 + (shown ? 380 : 0)}ms, opacity 250ms ease ${i * 32 + (shown ? 380 : 420)}ms`,
                          }}
                        >
                          {ch}
                        </span>
                      )
                    })}
                  </span>
                </span>
              )
            })}
          </span>
        )
      })}
    </p>
  )
}

// The domino wave: the sentence tips over letter by letter and the answer
// tips up in its place, bouncing as each tile lands.
export function DominoSentence() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-20% 0px' })
  const reduced = useReducedMotion()
  const [turned, setTurned] = useState(false)

  // the wave only runs while the sentence is on screen; reduced motion keeps the answer up
  useEffect(() => {
    if (reduced) return setTurned(true)
    if (!inView) return
    let t: ReturnType<typeof setTimeout>
    const loop = (next: boolean) => {
      t = setTimeout(() => {
        setTurned(next)
        loop(!next)
      }, next ? 2800 : 4600)
    }
    loop(!turned)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced])

  return (
    <div ref={ref} className="overflow-hidden py-8">
      <span className="sr-only">Hoje, o que sua equipe sabe está espalhado. No Praxis, cada coisa tem seu lugar.</span>
      <div className="mx-auto grid font-display text-[clamp(2.4rem,6.6vw,6.6rem)] font-bold leading-[1.08] tracking-[-0.04em] [perspective:900px]">
        <Sentence lines={front} shown={!turned} away />
        <Sentence lines={back} shown={turned} away={false} />
      </div>
    </div>
  )
}
