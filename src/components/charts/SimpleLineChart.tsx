interface LineChartData {
  label: string
  value: number
}

interface SimpleLineChartProps {
  data: LineChartData[]
  height?: number
  color?: string
  showArea?: boolean
}

export function SimpleLineChart({
  data,
  height = 200,
  color = 'hsl(var(--primary))',
  showArea = true,
}: SimpleLineChartProps) {
  if (data.length === 0) return null

  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const minValue = Math.min(...data.map((d) => d.value), 0)
  const range = maxValue - minValue || 1

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 100
    const y = 100 - ((d.value - minValue) / range) * 100
    return { x, y, value: d.value, label: d.label }
  })

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const areaD = `${pathD} L 100 100 L 0 100 Z`

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {showArea && (
          <path
            d={areaD}
            fill={color}
            fillOpacity="0.1"
          />
        )}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1"
            fill={color}
            className="hover:r-2 transition-all"
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  )
}
