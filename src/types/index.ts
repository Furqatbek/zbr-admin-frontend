// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

// User types
export type UserRole = 'ADMIN' | 'PLATFORM' | 'CONSUMER' | 'RESTAURANT_OWNER' | 'COURIER'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export interface User {
  id: number
  email: string
  phone?: string
  firstName: string
  lastName: string
  roles: UserRole[]
  status: UserStatus
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

// Auth types
export interface LoginRequest {
  emailOrPhone: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userId: number
  email: string
  fullName: string
  roles: UserRole[]
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

// Courier types
export type CourierStatus = 'PENDING_APPROVAL' | 'AVAILABLE' | 'BUSY' | 'OFFLINE'

export interface Courier {
  id: number
  userId: number
  userName: string
  status: CourierStatus
  verified: boolean
  verifiedAt?: string
  rating?: number
  totalDeliveries?: number
  currentLocation?: {
    lat: number
    lng: number
  }
}

// Restaurant types
export type RestaurantStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'

export interface Restaurant {
  id: number
  name: string
  description?: string
  address: string
  phone: string
  email?: string
  status: RestaurantStatus
  isOpen: boolean
  rating?: number
  totalOrders?: number
  ownerId: number
  ownerName?: string
  createdAt: string
  updatedAt: string
}

// Order types
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED'

export interface OrderItem {
  id: number
  name: string
  quantity: number
  price: number
}

export interface Order {
  id: number
  consumerId: number
  consumerName: string
  restaurantId: number
  restaurantName: string
  courierId?: number
  courierName?: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  deliveryAddress: string
  notes?: string
  createdAt: string
  updatedAt: string
  estimatedDeliveryTime?: string
}

// Dashboard types
export interface DashboardOverview {
  totalOrders: number
  totalRevenue: number
  activeUsers: number
  activeRestaurants: number
  activeCouriers: number
  pendingApprovals: number
}

export interface StuckOrder {
  id: number
  restaurantName: string
  status: OrderStatus
  stuckMinutes: number
  createdAt: string
}

// Analytics types
export interface RevenueData {
  date: string
  revenue: number
  orders: number
}

export interface PerformanceData {
  id: number
  name: string
  totalOrders: number
  averageRating: number
  revenue?: number
}

// Notification types
export type NotificationCategory =
  | 'ORDER'
  | 'FINANCE'
  | 'SUPPORT'
  | 'SYSTEM'
  | 'PROMOTION'
  | 'ACCOUNT'
  | 'DELIVERY'
  | 'RESTAURANT_OPS'
  | 'ALERT'

export type NotificationRole =
  | 'CUSTOMER'
  | 'COURIER'
  | 'RESTAURANT'
  | 'ADMIN'
  | 'SUPPORT'
  | 'FINANCE'
  | 'OPERATIONS'
  | 'ALL'

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'

export type BulkAction = 'MARK_READ' | 'DISMISS' | 'DELETE'

export type RelatedEntityType =
  | 'ORDER'
  | 'RESTAURANT'
  | 'COURIER'
  | 'CUSTOMER'
  | 'SUPPORT_TICKET'
  | 'PAYMENT'
  | 'PAYOUT'

export interface Notification {
  id: number
  userId?: number
  role?: NotificationRole
  category: NotificationCategory
  title: string
  message: string
  icon?: string
  actionUrl?: string
  relatedEntityType?: RelatedEntityType
  relatedEntityId?: number
  orderId?: number
  priority?: NotificationPriority
  isRead: boolean
  isDismissed: boolean
  readAt?: string
  createdAt: string
  expiresAt?: string
}

export interface CreateNotificationRequest {
  userId?: number
  role?: NotificationRole
  category: NotificationCategory
  title: string
  message: string
  icon?: string
  actionUrl?: string
  relatedEntityType?: RelatedEntityType
  relatedEntityId?: number
  orderId?: number
  priority?: NotificationPriority
  expiresAt?: string
}

export interface NotificationSearchRequest {
  userId?: number
  role?: NotificationRole
  isRead?: boolean
  category?: NotificationCategory
  orderId?: number
  createdFrom?: string
  createdTo?: string
  searchTerm?: string
  includeDismissed?: boolean
  page?: number
  pageSize?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}

export interface NotificationCounts {
  total: number
  unread: number
  byCategory: Record<NotificationCategory, number>
}

export interface BulkActionRequest {
  notificationIds: number[]
  action: BulkAction
}

export interface CleanupResponse {
  status: string
  deletedCount: number
}

export interface BulkActionResponse {
  status: string
  affectedCount: number
}

export interface MarkReadResponse {
  status: string
  markedCount: number
}

// Legacy - keeping for backward compatibility
export interface BroadcastNotification {
  title: string
  message: string
  targetRoles: UserRole[]
  priority: NotificationPriority
}

// Settings types
export interface PlatformSettings {
  commissionRate: number
  minDeliveryFee: number
  maxDeliveryFee: number
  minOrderAmount: number
  maxOrderAmount: number
  operatingRegions: string[]
  featureFlags: Record<string, boolean>
}

// Export types
export type ExportType = 'ORDERS' | 'USERS' | 'RESTAURANTS' | 'COURIERS' | 'REVENUE'
export type ExportFormat = 'CSV' | 'XLSX' | 'PDF'

export interface ExportRequest {
  type: ExportType
  startDate: string
  endDate: string
  format: ExportFormat
}
