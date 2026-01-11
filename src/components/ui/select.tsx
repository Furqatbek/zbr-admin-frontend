import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            'flex h-10 w-full appearance-none rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 pr-10 text-sm ring-offset-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[hsl(var(--destructive))] focus:ring-[hsl(var(--destructive))]',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        {error && <p className="mt-1 text-sm text-[hsl(var(--destructive))]">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

export { Select }
