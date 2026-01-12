import { Loader2 } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">Загрузка...</p>
      </div>
    </div>
  )
}
