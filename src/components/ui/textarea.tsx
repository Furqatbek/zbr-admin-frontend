import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm ring-offset-[hsl(var(--background))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[hsl(var(--destructive))] focus-visible:ring-[hsl(var(--destructive))]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[hsl(var(--destructive))]">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
