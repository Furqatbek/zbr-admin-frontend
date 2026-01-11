import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { AuthGuard } from '@/components/shared'

// Pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'

// Placeholder pages - will be implemented in later phases
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          Эта страница будет реализована в следующих фазах разработки
        </p>
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard requiredRoles={['ADMIN', 'PLATFORM']}>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      // Users
      {
        path: 'users',
        element: <PlaceholderPage title="Пользователи" />,
      },
      {
        path: 'users/roles',
        element: <PlaceholderPage title="Роли и права" />,
      },
      // Couriers
      {
        path: 'couriers',
        element: <PlaceholderPage title="Курьеры" />,
      },
      {
        path: 'couriers/verification',
        element: <PlaceholderPage title="Верификация курьеров" />,
      },
      {
        path: 'couriers/map',
        element: <PlaceholderPage title="Карта курьеров" />,
      },
      // Restaurants
      {
        path: 'restaurants',
        element: <PlaceholderPage title="Рестораны" />,
      },
      {
        path: 'restaurants/moderation',
        element: <PlaceholderPage title="Модерация ресторанов" />,
      },
      // Orders
      {
        path: 'orders',
        element: <PlaceholderPage title="Заказы" />,
      },
      {
        path: 'orders/issues',
        element: <PlaceholderPage title="Проблемные заказы" />,
      },
      // Analytics
      {
        path: 'analytics/revenue',
        element: <PlaceholderPage title="Аналитика доходов" />,
      },
      {
        path: 'analytics/orders',
        element: <PlaceholderPage title="Аналитика заказов" />,
      },
      {
        path: 'analytics/operations',
        element: <PlaceholderPage title="Операционная аналитика" />,
      },
      {
        path: 'analytics/financial',
        element: <PlaceholderPage title="Финансовая аналитика" />,
      },
      {
        path: 'analytics/cx',
        element: <PlaceholderPage title="Клиентский опыт" />,
      },
      {
        path: 'analytics/fraud',
        element: (
          <AuthGuard requiredRoles={['ADMIN']}>
            <PlaceholderPage title="Безопасность и фрод" />
          </AuthGuard>
        ),
      },
      {
        path: 'analytics/technical',
        element: <PlaceholderPage title="Технические метрики" />,
      },
      // Notifications
      {
        path: 'notifications/broadcast',
        element: <PlaceholderPage title="Рассылка уведомлений" />,
      },
      {
        path: 'notifications/cleanup',
        element: <PlaceholderPage title="Очистка уведомлений" />,
      },
      // Settings (Admin only)
      {
        path: 'settings',
        element: (
          <AuthGuard requiredRoles={['ADMIN']}>
            <PlaceholderPage title="Настройки платформы" />
          </AuthGuard>
        ),
      },
      {
        path: 'settings/export',
        element: (
          <AuthGuard requiredRoles={['ADMIN']}>
            <PlaceholderPage title="Экспорт данных" />
          </AuthGuard>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
