import * as React from 'react'
import { cn } from '@/lib/utils'

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  className?: string
}

interface DropdownContextValue {
  close: () => void
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null)

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const close = () => setIsOpen(false)

  return (
    <DropdownContext.Provider value={{ close }}>
      <div className="relative" ref={dropdownRef}>
        <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
        {isOpen && (
          <div
            className={cn(
              'absolute z-50 mt-2 min-w-[180px] rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-1 shadow-lg',
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
          >
            {children}
          </div>
        )}
      </div>
    </DropdownContext.Provider>
  )
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive'
}

export function DropdownItem({
  children,
  className,
  variant = 'default',
  onClick,
  ...props
}: DropdownItemProps) {
  const context = React.useContext(DropdownContext)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    context?.close()
  }

  return (
    <button
      className={cn(
        'flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors',
        variant === 'default' && 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]',
        variant === 'destructive' && 'text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-[hsl(var(--border))]" />
}
