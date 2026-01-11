import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { AuthGuard } from '@/components/shared'

// Pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { UsersPage, UserDetailsPage } from '@/pages/users'
import { OrdersPage, OrderDetailsPage } from '@/pages/orders'
import { CouriersPage, CourierDetailsPage, CourierVerificationPage } from '@/pages/couriers'
import { RestaurantsPage, RestaurantDetailsPage, RestaurantModerationPage } from '@/pages/restaurants'
import {
  RevenueAnalyticsPage,
  OrdersAnalyticsPage,
  OperationsAnalyticsPage,
  FinancialAnalyticsPage,
  CustomerExperienceAnalyticsPage,
  FraudAnalyticsPage,
  TechnicalMetricsPage,
} from '@/pages/analytics'

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
        element: <UsersPage />,
      },
      {
        path: 'users/:id',
        element: <UserDetailsPage />,
      },
      {
        path: 'users/roles',
        element: <PlaceholderPage title="Роли и права" />,
      },
      // Couriers
      {
        path: 'couriers',
        element: <CouriersPage />,
      },
      {
        path: 'couriers/:id',
        element: <CourierDetailsPage />,
      },
      {
        path: 'couriers/verification',
        element: <CourierVerificationPage />,
      },
      {
        path: 'couriers/map',
        element: <PlaceholderPage title="Карта курьеров" />,
      },
      // Restaurants
      {
        path: 'restaurants',
        element: <RestaurantsPage />,
      },
      {
        path: 'restaurants/:id',
        element: <RestaurantDetailsPage />,
      },
      {
        path: 'restaurants/moderation',
        element: <RestaurantModerationPage />,
      },
      // Orders
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'orders/:id',
        element: <OrderDetailsPage />,
      },
      {
        path: 'orders/issues',
        element: <PlaceholderPage title="Проблемные заказы" />,
      },
      // Analytics
      {
        path: 'analytics/revenue',
        element: <RevenueAnalyticsPage />,
      },
      {
        path: 'analytics/orders',
        element: <OrdersAnalyticsPage />,
      },
      {
        path: 'analytics/operations',
        element: <OperationsAnalyticsPage />,
      },
      {
        path: 'analytics/financial',
        element: <FinancialAnalyticsPage />,
      },
      {
        path: 'analytics/cx',
        element: <CustomerExperienceAnalyticsPage />,
      },
      {
        path: 'analytics/fraud',
        element: (
          <AuthGuard requiredRoles={['ADMIN']}>
            <FraudAnalyticsPage />
          </AuthGuard>
        ),
      },
      {
        path: 'analytics/technical',
        element: <TechnicalMetricsPage />,
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
