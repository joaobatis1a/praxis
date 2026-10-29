import { motion } from 'framer-motion'
import { DominoSentence } from './DominoSentence'

// Why the product exists: one sentence that tips over, letter by letter, into its answer.
export function Manifesto() {
  return (
    <section className="relative bg-[#06080d] px-6 pb-40 pt-28 sm:px-10">
      <div className="mx-auto max-w-[1300px] text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/35">Por que existe</p>
        <div className="mt-6">
          <DominoSentence />
        </div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20% 0px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="mx-auto mt-12 max-w-2xl text-lg leading-relaxed text-white/50"
        >
          Quando alguém sai ou o turno troca, o jeito certo de fazer as coisas não vai junto. Ele fica em documentos com dono,
          procedimentos que alguém conclui e avisos que chegam a quem precisa.
        </motion.p>
      </div>
    </section>
  )
}
