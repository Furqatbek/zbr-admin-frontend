import * as React from 'react'
import { cn, getInitials } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)

    const showFallback = !src || imageError

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {!showFallback ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="aspect-square h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[hsl(var(--muted))] font-medium text-[hsl(var(--muted-foreground))]">
            {name ? getInitials(name) : '?'}
          </div>
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export { Avatar }
