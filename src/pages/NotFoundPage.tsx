import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-[hsl(var(--primary))]">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Страница не найдена</h2>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          Запрашиваемая страница не существует или была перемещена
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              На главную
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
