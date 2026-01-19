import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Bike,
  UtensilsCrossed,
  Package,
  BarChart3,
  Bell,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  children?: { to: string; label: string }[]
}

function NavItem({ to, icon, label, children }: NavItemProps) {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(
    children?.some((child) => location.pathname.startsWith(child.to)) ?? false
  )

  const isActive = location.pathname === to || (children && location.pathname.startsWith(to))

  if (children) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
              : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
          )}
        >
          <div className="flex items-center gap-3">
            {icon}
            <span>{label}</span>
          </div>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {isOpen && (
          <div className="mt-1 ml-4 space-y-1 border-l border-[hsl(var(--border))] pl-4">
            {children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive }) =>
                  cn(
                    'block rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-medium'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
            : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  const { hasRole } = useAuthStore()
  const isAdmin = hasRole('ADMIN')

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-[hsl(var(--border))] px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
            <span className="text-sm font-bold text-[hsl(var(--primary-foreground))]">ZBR</span>
          </div>
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          <NavItem to="/" icon={<LayoutDashboard className="h-5 w-5" />} label="Главная" />

          <NavItem
            to="/users"
            icon={<Users className="h-5 w-5" />}
            label="Пользователи"
            children={[
              { to: '/users', label: 'Все пользователи' },
              { to: '/users/roles', label: 'Роли и права' },
            ]}
          />

          <NavItem
            to="/couriers"
            icon={<Bike className="h-5 w-5" />}
            label="Курьеры"
            children={[
              { to: '/couriers', label: 'Все курьеры' },
              { to: '/couriers/verification', label: 'Верификация' },
              { to: '/couriers/map', label: 'Карта курьеров' },
            ]}
          />

          <NavItem
            to="/restaurants"
            icon={<UtensilsCrossed className="h-5 w-5" />}
            label="Рестораны"
            children={[
              { to: '/restaurants', label: 'Все рестораны' },
              { to: '/restaurants/moderation', label: 'Модерация' },
            ]}
          />

          <NavItem
            to="/orders"
            icon={<Package className="h-5 w-5" />}
            label="Заказы"
            children={[
              { to: '/orders', label: 'Все заказы' },
              { to: '/orders/issues', label: 'Проблемные' },
            ]}
          />

          <NavItem
            to="/analytics"
            icon={<BarChart3 className="h-5 w-5" />}
            label="Аналитика"
            children={[
              { to: '/analytics/revenue', label: 'Доходы' },
              { to: '/analytics/orders', label: 'Заказы' },
              { to: '/analytics/operations', label: 'Курьеры' },
              { to: '/analytics/restaurants', label: 'Рестораны' },
              { to: '/analytics/financial', label: 'Финансы' },
              { to: '/analytics/cx', label: 'Клиентский опыт' },
              { to: '/analytics/support', label: 'Поддержка' },
              ...(isAdmin ? [{ to: '/analytics/fraud', label: 'Безопасность' }] : []),
              { to: '/analytics/technical', label: 'Технические' },
            ]}
          />

          <NavItem
            to="/notifications"
            icon={<Bell className="h-5 w-5" />}
            label="Уведомления"
            children={[
              { to: '/notifications', label: 'Все уведомления' },
              { to: '/notifications/broadcast', label: 'Рассылка' },
              ...(isAdmin ? [{ to: '/notifications/cleanup', label: 'Очистка' }] : []),
            ]}
          />

          {isAdmin && (
            <NavItem
              to="/settings"
              icon={<Settings className="h-5 w-5" />}
              label="Настройки"
              children={[
                { to: '/settings', label: 'Платформа' },
                { to: '/settings/export', label: 'Экспорт данных' },
              ]}
            />
          )}
        </div>
      </nav>
    </aside>
  )
}
