import { motion } from 'framer-motion'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../../../components/ui'

interface ProgressChartProps {
  data: { month: string; progresso: number }[]
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const count = payload[0].value
  return (
    <div className="rounded-md border border-border bg-surface-card px-3 py-2 shadow-[var(--shadow-level-2)]">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-semibold text-text-primary">
        {count} procedimento{count === 1 ? '' : 's'} concluído{count === 1 ? '' : 's'}
      </p>
    </div>
  )
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
    >
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-text-primary">Progresso da equipe</h3>
            <p className="text-sm text-text-muted">Procedimentos concluídos por mês</p>
          </div>
        </div>

        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="4 4" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={32}
                allowDecimals={false}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-border-strong)', strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="progresso"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#progressFill)"
                dot={false}
                activeDot={{ r: 5, fill: 'var(--color-primary)', stroke: 'var(--color-surface-card)', strokeWidth: 2 }}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  )
}
