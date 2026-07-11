import { Link } from 'react-router-dom'
import { buttonVariants } from '../../../components/ui'
import { cn } from '../../../lib/cn'

export function FinalCtaSection() {
  return (
    <section className="bg-primary py-16">
      <div className="mx-auto max-w-[var(--container-page)] px-6 text-center">
        <h2 className="text-3xl font-bold text-primary-foreground">
          Pronto para organizar o conhecimento da sua empresa?
        </h2>
        <p className="mt-3 text-primary-foreground/80">
          Comece gratuitamente, sem cartão de crédito.
        </p>
        <Link
          to="/signup"
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'lg' }),
            'mt-8 inline-flex border-0 bg-surface-card text-primary hover:bg-surface-card/90',
          )}
        >
          Criar conta gratuita
        </Link>
      </div>
    </section>
  )
}
