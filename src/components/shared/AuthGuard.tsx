import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/types'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
}

export function AuthGuard({ children, requiredRoles }: AuthGuardProps) {
  const location = useLocation()
  const { isAuthenticated, hasAnyRole } = useAuthStore()

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check required roles
  if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}

// Higher-order component for requiring specific roles
export function withRoleGuard(
  Component: React.ComponentType,
  requiredRoles: UserRole[]
) {
  return function GuardedComponent() {
    return (
      <AuthGuard requiredRoles={requiredRoles}>
        <Component />
      </AuthGuard>
    )
  }
}
