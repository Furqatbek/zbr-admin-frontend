import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { MainLayout } from '@/components/layout'
import { AuthGuard } from '@/components/shared'
import { PageLoader } from '@/components/ui'

// Eager loaded pages (critical path)
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'

// Lazy loaded pages for code splitting
const UsersPage = lazy(() => import('@/pages/users/UsersPage').then(m => ({ default: m.UsersPage })))
const UserDetailsPage = lazy(() => import('@/pages/users/UserDetailsPage').then(m => ({ default: m.UserDetailsPage })))
const UserRolesPage = lazy(() => import('@/pages/users/UserRolesPage').then(m => ({ default: m.UserRolesPage })))

const OrdersPage = lazy(() => import('@/pages/orders/OrdersPage').then(m => ({ default: m.OrdersPage })))
const OrderDetailsPage = lazy(() => import('@/pages/orders/OrderDetailsPage').then(m => ({ default: m.OrderDetailsPage })))
const ProblematicOrdersPage = lazy(() => import('@/pages/orders/ProblematicOrdersPage').then(m => ({ default: m.ProblematicOrdersPage })))
const LiveOrdersPage = lazy(() => import('@/pages/orders/LiveOrdersPage').then(m => ({ default: m.LiveOrdersPage })))

const CouriersPage = lazy(() => import('@/pages/couriers/CouriersPage').then(m => ({ default: m.CouriersPage })))
const CourierDetailsPage = lazy(() => import('@/pages/couriers/CourierDetailsPage').then(m => ({ default: m.CourierDetailsPage })))
const CourierVerificationPage = lazy(() => import('@/pages/couriers/CourierVerificationPage').then(m => ({ default: m.CourierVerificationPage })))
const CouriersMapPage = lazy(() => import('@/pages/couriers/CouriersMapPage').then(m => ({ default: m.CouriersMapPage })))

const RestaurantsPage = lazy(() => import('@/pages/restaurants/RestaurantsPage').then(m => ({ default: m.RestaurantsPage })))
const RestaurantDetailsPage = lazy(() => import('@/pages/restaurants/RestaurantDetailsPage').then(m => ({ default: m.RestaurantDetailsPage })))
const RestaurantModerationPage = lazy(() => import('@/pages/restaurants/RestaurantModerationPage').then(m => ({ default: m.RestaurantModerationPage })))

const RevenueAnalyticsPage = lazy(() => import('@/pages/analytics/RevenueAnalyticsPage').then(m => ({ default: m.RevenueAnalyticsPage })))
const OrdersAnalyticsPage = lazy(() => import('@/pages/analytics/OrdersAnalyticsPage').then(m => ({ default: m.OrdersAnalyticsPage })))
const OperationsAnalyticsPage = lazy(() => import('@/pages/analytics/OperationsAnalyticsPage').then(m => ({ default: m.OperationsAnalyticsPage })))
const FinancialAnalyticsPage = lazy(() => import('@/pages/analytics/FinancialAnalyticsPage').then(m => ({ default: m.FinancialAnalyticsPage })))
const CustomerExperienceAnalyticsPage = lazy(() => import('@/pages/analytics/CustomerExperienceAnalyticsPage').then(m => ({ default: m.CustomerExperienceAnalyticsPage })))
const FraudAnalyticsPage = lazy(() => import('@/pages/analytics/FraudAnalyticsPage').then(m => ({ default: m.FraudAnalyticsPage })))
const TechnicalMetricsPage = lazy(() => import('@/pages/analytics/TechnicalMetricsPage').then(m => ({ default: m.TechnicalMetricsPage })))
const RestaurantMetricsPage = lazy(() => import('@/pages/analytics/RestaurantMetricsPage').then(m => ({ default: m.RestaurantMetricsPage })))
const SupportMetricsPage = lazy(() => import('@/pages/analytics/SupportMetricsPage').then(m => ({ default: m.SupportMetricsPage })))

const NotificationsListPage = lazy(() => import('@/pages/notifications/NotificationsListPage').then(m => ({ default: m.NotificationsListPage })))
const NotificationBroadcastPage = lazy(() => import('@/pages/notifications/NotificationBroadcastPage').then(m => ({ default: m.NotificationBroadcastPage })))
const NotificationCleanupPage = lazy(() => import('@/pages/notifications/NotificationCleanupPage').then(m => ({ default: m.NotificationCleanupPage })))

const PlatformSettingsPage = lazy(() => import('@/pages/settings/PlatformSettingsPage').then(m => ({ default: m.PlatformSettingsPage })))
const DataExportPage = lazy(() => import('@/pages/settings/DataExportPage').then(m => ({ default: m.DataExportPage })))
const ReferralsPage = lazy(() => import('@/pages/settings/ReferralsPage').then(m => ({ default: m.ReferralsPage })))

// Wrapper for lazy loaded components
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
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
        element: <LazyPage><UsersPage /></LazyPage>,
      },
      {
        path: 'users/:id',
        element: <LazyPage><UserDetailsPage /></LazyPage>,
      },
      {
        path: 'users/roles',
        element: <LazyPage><UserRolesPage /></LazyPage>,
      },
      // Couriers
      {
        path: 'couriers',
        element: <LazyPage><CouriersPage /></LazyPage>,
      },
      {
        path: 'couriers/:id',
        element: <LazyPage><CourierDetailsPage /></LazyPage>,
      },
      {
        path: 'couriers/verification',
        element: <LazyPage><CourierVerificationPage /></LazyPage>,
      },
      {
        path: 'couriers/map',
        element: <LazyPage><CouriersMapPage /></LazyPage>,
      },
      // Restaurants
      {
        path: 'restaurants',
        element: <LazyPage><RestaurantsPage /></LazyPage>,
      },
      {
        path: 'restaurants/:id',
        element: <LazyPage><RestaurantDetailsPage /></LazyPage>,
      },
      {
        path: 'restaurants/moderation',
        element: <LazyPage><RestaurantModerationPage /></LazyPage>,
      },
      // Orders
      {
        path: 'orders',
        element: <LazyPage><OrdersPage /></LazyPage>,
      },
      {
        path: 'orders/:id',
        element: <LazyPage><OrderDetailsPage /></LazyPage>,
      },
      {
        path: 'orders/live',
        element: <LazyPage><LiveOrdersPage /></LazyPage>,
      },
      {
        path: 'orders/issues',
        element: <LazyPage><ProblematicOrdersPage /></LazyPage>,
      },
      // Analytics
      {
        path: 'analytics/revenue',
        element: <LazyPage><RevenueAnalyticsPage /></LazyPage>,
      },
      {
        path: 'analytics/orders',
        element: <LazyPage><OrdersAnalyticsPage /></LazyPage>,
      },
      {
        path: 'analytics/operations',
        element: <LazyPage><OperationsAnalyticsPage /></LazyPage>,
      },
      {
        path: 'analytics/financial',
        element: <LazyPage><FinancialAnalyticsPage /></LazyPage>,
      },
      {
        path: 'analytics/cx',
        element: <LazyPage><CustomerExperienceAnalyticsPage /></LazyPage>,
      },
      {
        path: 'analytics/fraud',
        element: (
          <AuthGuard requiredRoles={['ADMIN']}>
            <LazyPage><FraudAnalyticsPage /></LazyPage>
          </AuthGuard>
        ),
      },
      {
        path: 'analytics/technical',
        element: <LazyPage><TechnicalMetricsPage /></LazyPage>,
      },
      {
        path: 'analytics/restaurants',
        element: <LazyPage><RestaurantMetricsPage /></LazyPage>,
      },
      {
        path: 'analytics/support',
        element: <LazyPage><SupportMetricsPage /></LazyPage>,
      },
      // Notifications
      {
        path: 'notifications',
        element: <LazyPage><NotificationsListPage /></LazyPage>,
      },
      {
        path: 'notifications/broadcast',
        element: <LazyPage><NotificationBroadcastPage /></LazyPage>,
      },
      {
        path: 'notifications/cleanup',
        element: (
          <AuthGuard requiredRoles={['ADMIN']}>
            <LazyPage><NotificationCleanupPage /></LazyPage>
          </AuthGuard>
        ),
      },
      // Settings (Admin only)
      {
        path: 'settings',
        element: (
          <AuthGuard requiredRoles={['ADMIN']}>
            <LazyPage><PlatformSettingsPage /></LazyPage>
          </AuthGuard>
        ),
      },
      {
        path: 'settings/export',
        element: (
          <AuthGuard requiredRoles={['ADMIN']}>
            <LazyPage><DataExportPage /></LazyPage>
          </AuthGuard>
        ),
      },
      {
        path: 'settings/referrals',
        element: (
          <AuthGuard requiredRoles={['ADMIN', 'PLATFORM']}>
            <LazyPage><ReferralsPage /></LazyPage>
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
