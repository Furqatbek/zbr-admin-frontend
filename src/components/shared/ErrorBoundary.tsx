import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--destructive))]/10">
              <AlertTriangle className="h-8 w-8 text-[hsl(var(--destructive))]" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">Что-то пошло не так</h2>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">
              Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную.
            </p>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-[hsl(var(--muted-foreground))] hover:text-foreground">
                  Подробности ошибки
                </summary>
                <pre className="mt-2 rounded bg-[hsl(var(--muted))] p-3 text-xs overflow-x-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={this.handleGoHome}>
                <Home className="mr-2 h-4 w-4" />
                На главную
              </Button>
              <Button onClick={this.handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Попробовать снова
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
