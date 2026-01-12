import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { Badge } from '../badge'

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Status</Badge>)
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('applies default variant styles', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByText('Default')).toHaveClass('bg-[hsl(var(--primary))]')
  })

  it('applies secondary variant styles', () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText('Secondary')).toHaveClass('bg-[hsl(var(--secondary))]')
  })

  it('applies destructive variant styles', () => {
    render(<Badge variant="destructive">Destructive</Badge>)
    expect(screen.getByText('Destructive')).toHaveClass('bg-[hsl(var(--destructive))]')
  })

  it('applies success variant styles', () => {
    render(<Badge variant="success">Success</Badge>)
    expect(screen.getByText('Success')).toHaveClass('bg-[hsl(var(--success))]')
  })

  it('applies warning variant styles', () => {
    render(<Badge variant="warning">Warning</Badge>)
    expect(screen.getByText('Warning')).toHaveClass('bg-[hsl(var(--warning))]')
  })

  it('applies outline variant styles', () => {
    render(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText('Outline')).toHaveClass('text-[hsl(var(--foreground))]')
  })

  it('merges custom className with default classes', () => {
    render(<Badge className="custom-badge">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-badge')
    expect(badge).toHaveClass('inline-flex')
  })

  it('passes through HTML attributes', () => {
    render(<Badge data-testid="test-badge" role="status">Test</Badge>)
    expect(screen.getByTestId('test-badge')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
