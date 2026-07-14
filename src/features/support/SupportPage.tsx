import { motion } from 'framer-motion'
import { Mail, MessageCircle } from 'lucide-react'
import { buttonVariants, Card } from '../../components/ui'
import { cn } from '../../lib/cn'
import { staggerContainer, staggerItem } from '../../lib/motionVariants'

const SUPPORT_EMAIL = 'pessoalba1is1a@gmail.com'
const SUPPORT_WHATSAPP = '5581982594090'
const SUPPORT_WHATSAPP_DISPLAY = '+55 (81) 98259-4090'

export function SupportPage() {
  return (
    <div className="mx-auto max-w-[720px] p-6 lg:p-8">
      <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-text-primary">
        Suporte
      </motion.h1>
      <p className="mt-1 text-sm text-text-muted">Precisa de ajuda? Fale diretamente com a gente.</p>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mt-6 space-y-4">
        <motion.div variants={staggerItem}>
          <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageCircle size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text-primary">WhatsApp</h2>
                <p className="text-sm text-text-muted">{SUPPORT_WHATSAPP_DISPLAY}</p>
              </div>
            </div>
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'primary' }), 'shrink-0')}
            >
              Chamar no WhatsApp
            </a>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text-primary">E-mail</h2>
                <p className="text-sm text-text-muted">{SUPPORT_EMAIL}</p>
              </div>
            </div>
            <a href={`mailto:${SUPPORT_EMAIL}`} className={cn(buttonVariants({ variant: 'secondary' }), 'shrink-0')}>
              Enviar e-mail
            </a>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
