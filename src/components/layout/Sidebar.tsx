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
  isOpen: boolean
  onToggle: () => void
  children?: { to: string; label: string }[]
}

function NavItem({ to, icon, label, isOpen, onToggle, children }: NavItemProps) {
  const location = useLocation()
  const isActive = location.pathname === to || (children && location.pathname.startsWith(to))

  if (children) {
    return (
      <div>
        <button
          onClick={onToggle}
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
      onClick={onToggle}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  const { hasRole } = useAuthStore()
  const isAdmin = hasRole('ADMIN')
  const location = useLocation()

  const sections = [
    '/',
    '/users',
    '/couriers',
    '/restaurants',
    '/orders',
    '/analytics',
    '/notifications',
    '/settings',
  ]

  const initialOpen = sections.find(
    (s) => s === '/' ? location.pathname === '/' || location.pathname.startsWith('/dashboard') : location.pathname.startsWith(s)
  ) ?? null

  const [openSection, setOpenSection] = useState<string | null>(initialOpen)

  const toggle = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section))
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-width)] flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-[hsl(var(--border))] px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
            <span className="text-sm font-bold text-[hsl(var(--primary-foreground))]">ZBR</span>
          </div>
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          <NavItem
            to="/"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Главная"
            isOpen={openSection === '/'}
            onToggle={() => toggle('/')}
            children={[
              { to: '/', label: 'Обзор' },
              { to: '/dashboard/filtered-orders', label: 'Фильтр заказов' },
              { to: '/dashboard/realtime', label: 'Мониторинг' },
            ]}
          />

          <NavItem
            to="/users"
            icon={<Users className="h-5 w-5" />}
            label="Пользователи"
            isOpen={openSection === '/users'}
            onToggle={() => toggle('/users')}
            children={[
              { to: '/users', label: 'Все пользователи' },
              { to: '/users/roles', label: 'Роли и права' },
            ]}
          />

          <NavItem
            to="/couriers"
            icon={<Bike className="h-5 w-5" />}
            label="Курьеры"
            isOpen={openSection === '/couriers'}
            onToggle={() => toggle('/couriers')}
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
            isOpen={openSection === '/restaurants'}
            onToggle={() => toggle('/restaurants')}
            children={[
              { to: '/restaurants', label: 'Все рестораны' },
              { to: '/restaurants/moderation', label: 'Модерация' },
              { to: '/restaurants/directory', label: 'Каталог' },
            ]}
          />

          <NavItem
            to="/orders"
            icon={<Package className="h-5 w-5" />}
            label="Заказы"
            isOpen={openSection === '/orders'}
            onToggle={() => toggle('/orders')}
            children={[
              { to: '/orders', label: 'Все заказы' },
              { to: '/orders/live', label: 'Активные заказы' },
              { to: '/orders/issues', label: 'Проблемные' },
              { to: '/orders/create', label: 'Создать заказ' },
            ]}
          />

          <NavItem
            to="/analytics"
            icon={<BarChart3 className="h-5 w-5" />}
            label="Аналитика"
            isOpen={openSection === '/analytics'}
            onToggle={() => toggle('/analytics')}
            children={[
              { to: '/analytics/users', label: 'Пользователи' },
              { to: '/analytics/revenue', label: 'Доходы' },
              { to: '/analytics/orders', label: 'Заказы' },
              { to: '/analytics/operations', label: 'Курьеры' },
              { to: '/analytics/restaurants', label: 'Рестораны' },
              { to: '/analytics/financial', label: 'Финансы' },
              { to: '/analytics/cx', label: 'Клиентский опыт' },
              { to: '/analytics/support', label: 'Поддержка' },
              { to: '/analytics/cx-ratings', label: 'Рейтинги CX' },
              ...(isAdmin ? [{ to: '/analytics/fraud', label: 'Безопасность' }] : []),
              { to: '/analytics/technical', label: 'Технические' },
              ...(isAdmin ? [{ to: '/analytics/legacy', label: 'Сводная панель' }] : []),
            ]}
          />

          <NavItem
            to="/notifications"
            icon={<Bell className="h-5 w-5" />}
            label="Уведомления"
            isOpen={openSection === '/notifications'}
            onToggle={() => toggle('/notifications')}
            children={[
              { to: '/notifications', label: 'Все уведомления' },
              { to: '/notifications/inbox', label: 'Входящие' },
              { to: '/notifications/broadcast', label: 'Рассылка' },
              ...(isAdmin ? [{ to: '/notifications/templates', label: 'Шаблоны' }] : []),
              ...(isAdmin ? [{ to: '/notifications/cleanup', label: 'Очистка' }] : []),
            ]}
          />

          <NavItem
            to="/settings"
            icon={<Settings className="h-5 w-5" />}
            label="Настройки"
            isOpen={openSection === '/settings'}
            onToggle={() => toggle('/settings')}
            children={[
              ...(isAdmin ? [{ to: '/settings', label: 'Платформа' }] : []),
              { to: '/settings/referrals', label: 'Рефералы' },
              { to: '/settings/my-referrals', label: 'Мои рефералы' },
              ...(isAdmin ? [{ to: '/settings/api', label: 'SMS API' }] : []),
              ...(isAdmin ? [{ to: '/settings/images', label: 'Изображения' }] : []),
              ...(isAdmin ? [{ to: '/settings/export', label: 'Экспорт данных' }] : []),
            ]}
          />
        </div>
      </nav>
    </aside>
  )
}
