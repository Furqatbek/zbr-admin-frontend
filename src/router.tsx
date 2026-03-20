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
const OrderCreatePage = lazy(() => import('@/pages/orders/OrderCreatePage').then(m => ({ default: m.OrderCreatePage })))

const CouriersPage = lazy(() => import('@/pages/couriers/CouriersPage').then(m => ({ default: m.CouriersPage })))
const CourierDetailsPage = lazy(() => import('@/pages/couriers/CourierDetailsPage').then(m => ({ default: m.CourierDetailsPage })))
const CourierVerificationPage = lazy(() => import('@/pages/couriers/CourierVerificationPage').then(m => ({ default: m.CourierVerificationPage })))
const CouriersMapPage = lazy(() => import('@/pages/couriers/CouriersMapPage').then(m => ({ default: m.CouriersMapPage })))
const CourierOperationsPage = lazy(() => import('@/pages/couriers/CourierOperationsPage').then(m => ({ default: m.CourierOperationsPage })))

const RestaurantsPage = lazy(() => import('@/pages/restaurants/RestaurantsPage').then(m => ({ default: m.RestaurantsPage })))
const RestaurantDetailsPage = lazy(() => import('@/pages/restaurants/RestaurantDetailsPage').then(m => ({ default: m.RestaurantDetailsPage })))
const RestaurantModerationPage = lazy(() => import('@/pages/restaurants/RestaurantModerationPage').then(m => ({ default: m.RestaurantModerationPage })))
const RestaurantMenuPage = lazy(() => import('@/pages/restaurants/RestaurantMenuPage').then(m => ({ default: m.RestaurantMenuPage })))
const RestaurantDirectoryPage = lazy(() => import('@/pages/restaurants/RestaurantDirectoryPage').then(m => ({ default: m.RestaurantDirectoryPage })))

const RevenueAnalyticsPage = lazy(() => import('@/pages/analytics/RevenueAnalyticsPage').then(m => ({ default: m.RevenueAnalyticsPage })))
const OrdersAnalyticsPage = lazy(() => import('@/pages/analytics/OrdersAnalyticsPage').then(m => ({ default: m.OrdersAnalyticsPage })))
const OperationsAnalyticsPage = lazy(() => import('@/pages/analytics/OperationsAnalyticsPage').then(m => ({ default: m.OperationsAnalyticsPage })))
const FinancialAnalyticsPage = lazy(() => import('@/pages/analytics/FinancialAnalyticsPage').then(m => ({ default: m.FinancialAnalyticsPage })))
const CustomerExperienceAnalyticsPage = lazy(() => import('@/pages/analytics/CustomerExperienceAnalyticsPage').then(m => ({ default: m.CustomerExperienceAnalyticsPage })))
const FraudAnalyticsPage = lazy(() => import('@/pages/analytics/FraudAnalyticsPage').then(m => ({ default: m.FraudAnalyticsPage })))
const TechnicalMetricsPage = lazy(() => import('@/pages/analytics/TechnicalMetricsPage').then(m => ({ default: m.TechnicalMetricsPage })))
const RestaurantMetricsPage = lazy(() => import('@/pages/analytics/RestaurantMetricsPage').then(m => ({ default: m.RestaurantMetricsPage })))
const SupportMetricsPage = lazy(() => import('@/pages/analytics/SupportMetricsPage').then(m => ({ default: m.SupportMetricsPage })))
const UserAnalyticsPage = lazy(() => import('@/pages/analytics/UserAnalyticsPage').then(m => ({ default: m.UserAnalyticsPage })))
const LegacyAnalyticsDashboardPage = lazy(() => import('@/pages/analytics/LegacyAnalyticsDashboardPage').then(m => ({ default: m.LegacyAnalyticsDashboardPage })))
const CxRatingsPage = lazy(() => import('@/pages/analytics/CxRatingsPage').then(m => ({ default: m.CxRatingsPage })))

const NotificationsListPage = lazy(() => import('@/pages/notifications/NotificationsListPage').then(m => ({ default: m.NotificationsListPage })))
const NotificationBroadcastPage = lazy(() => import('@/pages/notifications/NotificationBroadcastPage').then(m => ({ default: m.NotificationBroadcastPage })))
const NotificationCleanupPage = lazy(() => import('@/pages/notifications/NotificationCleanupPage').then(m => ({ default: m.NotificationCleanupPage })))
const NotificationTemplatesPage = lazy(() => import('@/pages/notifications/NotificationTemplatesPage').then(m => ({ default: m.NotificationTemplatesPage })))
const NotificationInboxPage = lazy(() => import('@/pages/notifications/NotificationInboxPage').then(m => ({ default: m.NotificationInboxPage })))

const PlatformSettingsPage = lazy(() => import('@/pages/settings/PlatformSettingsPage').then(m => ({ default: m.PlatformSettingsPage })))
const DataExportPage = lazy(() => import('@/pages/settings/DataExportPage').then(m => ({ default: m.DataExportPage })))
const ReferralsPage = lazy(() => import('@/pages/settings/ReferralsPage').then(m => ({ default: m.ReferralsPage })))
const ApiSettingsPage = lazy(() => import('@/pages/settings/ApiSettingsPage').then(m => ({ default: m.ApiSettingsPage })))
const ImageManagementPage = lazy(() => import('@/pages/settings/ImageManagementPage').then(m => ({ default: m.ImageManagementPage })))
const ReferralManagementPage = lazy(() => import('@/pages/settings/ReferralManagementPage').then(m => ({ default: m.ReferralManagementPage })))

const FilteredOrdersPage = lazy(() => import('@/pages/dashboard/FilteredOrdersPage').then(m => ({ default: m.FilteredOrdersPage })))
const RealtimeMonitorPage = lazy(() => import('@/pages/dashboard/RealtimeMonitorPage').then(m => ({ default: m.RealtimeMonitorPage })))

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
      // Dashboard
      {
        path: 'dashboard/filtered-orders',
        element: <LazyPage><FilteredOrdersPage /></LazyPage>,
      },
      {
        path: 'dashboard/realtime',
        element: <LazyPage><RealtimeMonitorPage /></LazyPage>,
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
      {
        path: 'couriers/operations',
        element: <LazyPage><CourierOperationsPage /></LazyPage>,
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
      {
        path: 'restaurants/:id/menu',
        element: <LazyPage><RestaurantMenuPage /></LazyPage>,
      },
      {
        path: 'restaurants/directory',
        element: <LazyPage><RestaurantDirectoryPage /></LazyPage>,
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
      {
        path: 'orders/create',
        element: <LazyPage><OrderCreatePage /></LazyPage>,
      },
      // Analytics
      {
        path: 'analytics/users',
        element: <LazyPage><UserAnalyticsPage /></LazyPage>,
      },
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
      {
        path: 'analytics/legacy',
        element: (
          <AuthGuard requiredRoles={['ADMIN']}>
            <LazyPage><LegacyAnalyticsDashboardPage /></LazyPage>
          </AuthGuard>
        ),
      },
      {
        path: 'analytics/cx-ratings',
        element: <LazyPage><CxRatingsPage /></LazyPage>,
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
      {
        path: 'notifications/templates',
        element: (
          <AuthGuard requiredRoles={['ADMIN']}>
            <LazyPage><NotificationTemplatesPage /></LazyPage>
          </AuthGuard>
        ),
      },
      {
        path: 'notifications/inbox',
        element: <LazyPage><NotificationInboxPage /></LazyPage>,
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
      {
        path: 'settings/api',
        element: (
          <AuthGuard requiredRoles={['ADMIN']}>
            <LazyPage><ApiSettingsPage /></LazyPage>
          </AuthGuard>
        ),
      },
      {
        path: 'settings/images',
        element: (
          <AuthGuard requiredRoles={['ADMIN']}>
            <LazyPage><ImageManagementPage /></LazyPage>
          </AuthGuard>
        ),
      },
      {
        path: 'settings/my-referrals',
        element: <LazyPage><ReferralManagementPage /></LazyPage>,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
