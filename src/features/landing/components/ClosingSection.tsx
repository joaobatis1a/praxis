import { isSupabase } from '../../../lib/dataSource'
import { CtaPill } from './CtaPill'
import { Reveal } from './Reveal'
import { Sheet } from './Sheet'
import { SplitText } from './SplitText'

// The last light sheet: the single invitation to talk.
export function ClosingSection() {
  return (
    <Sheet className="z-30 bg-[#f4f5f7] px-6 pb-28 pt-24 text-[#0b0d12] sm:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div id="contato" className="flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-end">
          <h2 className="font-display text-[clamp(2.8rem,8.4vw,8rem)] font-bold leading-[0.92] tracking-[-0.045em] text-[#0b0d12]">
            <span className="block">
              <SplitText text="Vamos" whenInView stagger={0.04} />
            </span>
            <span className="block">
              <SplitText text="conversar?" whenInView delay={0.15} stagger={0.04} />
            </span>
          </h2>
          <Reveal delay={0.1} className="max-w-sm lg:pb-4">
            <p className="text-lg leading-relaxed text-[#0b0d12]/65">
              {isSupabase
                ? 'Conta pra gente como sua empresa funciona e a gente te mostra o Praxis rodando nela.'
                : 'Entre com uma conta de demonstração e veja o Praxis funcionando de verdade.'}
            </p>
            <CtaPill size="lg" className="mt-8" />
          </Reveal>
        </div>
      </div>
    </Sheet>
  )
}
