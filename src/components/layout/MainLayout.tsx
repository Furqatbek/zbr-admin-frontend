import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Sidebar />
      <div className="pl-[var(--sidebar-width)]">
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
