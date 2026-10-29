import { DiveIn } from './DiveIn'
import { SplitText } from './SplitText'

// A new hire's first morning: the camera dives through a desktop buried in
// chats, inboxes and stray files, straight into the Praxis.
export function FirstDaySection() {
  return (
    <section className="relative z-[25] bg-[#06080d]">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-6 px-6 pb-6 pt-28 sm:px-10">
        <h2 className="font-display text-[clamp(2.4rem,6vw,5.6rem)] font-bold leading-[0.95] tracking-[-0.045em] text-white">
          <span className="block">
            <SplitText text="O primeiro dia" whenInView stagger={0.03} />
          </span>
          <span className="block text-white/35">
            <SplitText text="de alguém novo." whenInView delay={0.2} stagger={0.03} />
          </span>
        </h2>
        <p className="max-w-xs pb-2 text-[13px] font-semibold uppercase leading-relaxed tracking-[0.12em] text-white/50">
          Role devagar e entre na tela.
        </p>
      </div>
      <DiveIn />
    </section>
  )
}
