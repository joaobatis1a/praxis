export function CircularProgress({ value, size = 120 }: { value: number; size?: number }) {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(90 ${size / 2} ${size / 2})`}
        className="text-2xl font-bold"
        style={{ fill: 'var(--color-text-primary)' }}
      >
        {value}%
      </text>
    </svg>
  )
}
