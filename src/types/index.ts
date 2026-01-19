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
export type CourierStatus = 'PENDING_APPROVAL' | 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ON_BREAK' | 'SUSPENDED'

export type VehicleType = 'WALKING' | 'BICYCLE' | 'E_BIKE' | 'MOTORCYCLE' | 'CAR' | 'VAN'

export interface Courier {
  id: number
  userId: number
  userName?: string
  vehicleType?: VehicleType
  vehicleNumber?: string
  licenseNumber?: string
  status: CourierStatus
  isVerified: boolean
  verifiedAt?: string
  rating: number
  totalDeliveries: number
  currentLatitude?: number
  currentLongitude?: number
  currentOrderCount?: number
  maxConcurrentOrders?: number
  preferredRadiusKm?: number
  lastLocationUpdate?: string
  createdAt: string
  // Legacy fields for backward compatibility
  verified?: boolean
  currentLocation?: {
    lat: number
    lng: number
  }
}

export interface CourierRegistrationRequest {
  vehicleType: VehicleType
  vehicleNumber?: string
  licenseNumber?: string
  preferredRadiusKm?: number
}

export interface AvailableCourier {
  id: number
  userId: number
  vehicleType: VehicleType
  status: CourierStatus
  rating: number
  currentLatitude: number
  currentLongitude: number
  distanceKm: number
}

export interface CourierStatistics {
  totalCouriers: number
  pendingApproval: number
  online: number
  offline: number
  suspended: number
  verified: number
  available: number
  busy: number
  onBreak: number
}

export interface CourierUpdateRequest {
  vehicleType?: VehicleType
  vehicleNumber?: string
  licenseNumber?: string
  preferredRadiusKm?: number
  maxConcurrentOrders?: number
}

// Restaurant types
export type RestaurantStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CLOSED' | 'REJECTED'

export interface Restaurant {
  id: number
  ownerId: number
  ownerName?: string
  name: string
  slug: string
  description?: string
  logoUrl?: string
  coverImageUrl?: string
  phone: string
  email?: string
  fullAddress: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  latitude?: number
  longitude?: number
  status: RestaurantStatus
  featured: boolean
  acceptsDelivery: boolean
  acceptsTakeaway: boolean
  acceptsDineIn: boolean
  minimumOrder?: number
  deliveryFee?: number
  deliveryRadiusKm?: number
  averagePrepTimeMinutes?: number
  opensAt?: string
  closesAt?: string
  isOpen: boolean
  isCurrentlyOpen: boolean
  averageRating?: number
  totalRatings?: number
  totalOrders?: number
  createdAt: string
  updatedAt?: string
}

export interface CreateRestaurantRequest {
  name: string
  description?: string
  phone: string
  email?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postalCode?: string
  country?: string
  latitude?: number
  longitude?: number
  acceptsDelivery?: boolean
  acceptsTakeaway?: boolean
  acceptsDineIn?: boolean
  minimumOrder?: number
  deliveryFee?: number
  deliveryRadiusKm?: number
  averagePrepTimeMinutes?: number
  opensAt?: string
  closesAt?: string
}

export interface UpdateRestaurantRequest extends Partial<CreateRestaurantRequest> {}

// Menu types
export interface MenuCategory {
  id: number
  restaurantId: number
  name: string
  description?: string
  imageUrl?: string
  sortOrder: number
  active: boolean
  items?: MenuItem[]
}

export interface CreateMenuCategoryRequest {
  name: string
  description?: string
  imageUrl?: string
  sortOrder?: number
}

export interface MenuItem {
  id: number
  categoryId: number
  categoryName?: string
  name: string
  description?: string
  price: number
  priceWithMargin?: number
  originalPrice?: number
  effectivePrice?: number
  onSale?: boolean
  discountPercentage?: number
  imageUrl?: string
  inStock: boolean
  featured: boolean
  prepTimeMinutes?: number
  calories?: number
  vegetarian?: boolean
  vegan?: boolean
  glutenFree?: boolean
  spicy?: boolean
  allergens?: string
  sortOrder?: number
  variants?: ItemVariant[]
  options?: ItemOption[]
}

export interface ItemVariant {
  id: number
  name: string
  priceDelta: number
  totalPrice?: number
  inStock: boolean
  sortOrder?: number
}

export interface ItemOption {
  id: number
  groupName?: string
  name: string
  priceDelta: number
  isDefault: boolean
  maxSelections?: number
  required: boolean
  inStock: boolean
}

export interface CreateMenuItemRequest {
  categoryId: number
  name: string
  description?: string
  price: number
  originalPrice?: number
  imageUrl?: string
  prepTimeMinutes?: number
  calories?: number
  vegetarian?: boolean
  vegan?: boolean
  glutenFree?: boolean
  spicy?: boolean
  allergens?: string
  featured?: boolean
  sortOrder?: number
  variants?: Omit<ItemVariant, 'id' | 'totalPrice' | 'inStock'>[]
  options?: Omit<ItemOption, 'id' | 'inStock'>[]
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

// Notification enum option types (from backend API)
export interface NotificationTypeOption {
  value: string
  displayName: string
  code: string
  description?: string
}

export interface NotificationRoleOption {
  value: NotificationRole
  displayName: string
  code: string
  description?: string
}

export interface NotificationCategoryOption {
  value: NotificationCategory
  displayName: string
  code: string
  description?: string
}

export interface NotificationPriorityOption {
  value: NotificationPriority
  displayName: string
  code: string
}

export interface NotificationReferenceData {
  types: NotificationTypeOption[]
  roles: NotificationRoleOption[]
  categories: NotificationCategoryOption[]
  priorities: NotificationPriorityOption[]
}

// Notification template types
export interface NotificationTemplate {
  id: number
  type: string
  role: NotificationRole
  category: NotificationCategory
  title: string
  messageTemplate: string
  icon?: string
  defaultPriority: NotificationPriority
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTemplateRequest {
  type: string
  role: NotificationRole
  category: NotificationCategory
  title: string
  messageTemplate: string
  icon?: string
  defaultPriority?: NotificationPriority
}

export interface UpdateTemplateRequest {
  title?: string
  messageTemplate?: string
  icon?: string
  defaultPriority?: NotificationPriority
  category?: NotificationCategory
}

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
  notificationType?: string
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
