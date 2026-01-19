interface BarChartData {
  label: string
  value: number
  color?: string
}

interface SimpleBarChartProps {
  data: BarChartData[]
  height?: number
  showValues?: boolean
  valueFormatter?: (value: number) => string
}

export function SimpleBarChart({
  data,
  height = 200,
  showValues = true,
  valueFormatter = (v) => v.toString(),
}: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex h-full items-end gap-2">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100
          return (
            <div key={index} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full flex-col items-center">
                {showValues && (
                  <span className="mb-1 text-xs text-[hsl(var(--muted-foreground))]">
                    {valueFormatter(item.value)}
                  </span>
                )}
                <div
                  className="w-full rounded-t transition-all duration-300"
                  style={{
                    height: `${Math.max(barHeight, 2)}%`,
                    backgroundColor: item.color || 'hsl(var(--primary))',
                    minHeight: '4px',
                  }}
                />
              </div>
              <span className="text-xs text-[hsl(var(--muted-foreground))] truncate max-w-full">
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
