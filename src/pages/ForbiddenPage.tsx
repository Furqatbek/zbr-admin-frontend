import { Link } from 'react-router-dom'
import { Home, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui'

export function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--destructive))]/10">
          <ShieldAlert className="h-10 w-10 text-[hsl(var(--destructive))]" />
        </div>
        <h1 className="text-4xl font-bold">403</h1>
        <h2 className="mt-2 text-xl font-semibold">Доступ запрещён</h2>
        <p className="mt-2 text-[hsl(var(--muted-foreground))] max-w-md">
          У вас недостаточно прав для просмотра этой страницы. Обратитесь к администратору системы.
        </p>
        <div className="mt-6">
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
