import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../../../components/ui'

interface ProgressChartProps {
  data: { month: string; progresso: number }[]
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-surface-card px-3 py-2 shadow-[var(--shadow-level-2)]">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-semibold text-text-primary">{payload[0].value}% de progresso</p>
    </div>
  )
}

export function ProgressChart({ data }: ProgressChartProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Progresso da equipe</h3>
          <p className="text-sm text-text-muted">Média de conclusão de treinamentos por mês</p>
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
              width={42}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              tickFormatter={(v) => `${v}%`}
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
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
