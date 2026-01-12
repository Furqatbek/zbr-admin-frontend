import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/components/layout'
import { AuthGuard } from '@/components/shared'

// Pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { UsersPage, UserDetailsPage, UserRolesPage } from '@/pages/users'
import { OrdersPage, OrderDetailsPage, ProblematicOrdersPage } from '@/pages/orders'
import { CouriersPage, CourierDetailsPage, CourierVerificationPage, CouriersMapPage } from '@/pages/couriers'
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
import { NotificationBroadcastPage, NotificationCleanupPage } from '@/pages/notifications'
import { PlatformSettingsPage, DataExportPage } from '@/pages/settings'

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
        element: <UserRolesPage />,
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
        element: <CouriersMapPage />,
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
        element: <ProblematicOrdersPage />,
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
        element: <NotificationBroadcastPage />,
      },
      {
        path: 'notifications/cleanup',
        element: <NotificationCleanupPage />,
      },
      // Settings (Admin only)
      {
        path: 'settings',
        element: (
          <AuthGuard requiredRoles={['ADMIN']}>
            <PlatformSettingsPage />
          </AuthGuard>
        ),
      },
      {
        path: 'settings/export',
        element: (
          <AuthGuard requiredRoles={['ADMIN']}>
            <DataExportPage />
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
