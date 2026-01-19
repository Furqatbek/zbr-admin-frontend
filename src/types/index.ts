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
  | 'CREATED'
  | 'PENDING'
  | 'CONFIRMED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'

export type OrderType = 'DELIVERY' | 'TAKEAWAY' | 'PICKUP' | 'DINE_IN'

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED'

export interface OrderItemModifier {
  id: number
  name: string
  price: number
}

export interface OrderItem {
  id: number
  menuItemId?: number
  name: string
  itemName?: string
  quantity: number
  price: number
  unitPrice?: number
  totalPrice?: number
  variantName?: string
  variantPriceDelta?: number
  modifiers?: OrderItemModifier[]
  modifiersTotal?: number
  specialInstructions?: string
}

export interface Order {
  id: number
  externalOrderNo?: string
  consumerId: number
  consumerName: string
  restaurantId: number
  restaurantName: string
  courierId?: number
  courierName?: string
  orderType?: OrderType
  status: OrderStatus
  paymentStatus?: PaymentStatus
  items: OrderItem[]
  subtotal: number
  tax?: number
  deliveryFee: number
  discount?: number
  tipAmount?: number
  total: number
  deliveryAddress: string
  deliveryLatitude?: number
  deliveryLongitude?: number
  deliveryInstructions?: string
  tableId?: string
  customerName?: string
  customerPhone?: string
  notes?: string
  cancellationReason?: string
  estimatedPrepTimeMinutes?: number
  estimatedDeliveryTime?: string
  createdAt: string
  updatedAt: string
  acceptedAt?: string
  readyAt?: string
  deliveredAt?: string
}

// Order creation types
export interface CreateOrderItemRequest {
  menuItemId: number
  quantity: number
  variantId?: number
  optionIds?: number[]
  specialInstructions?: string
}

export interface CreateOrderRequest {
  restaurantId: number
  orderType: OrderType
  items: CreateOrderItemRequest[]
  deliveryAddress?: string
  deliveryLatitude?: number
  deliveryLongitude?: number
  deliveryInstructions?: string
  tableId?: string
  customerName?: string
  customerPhone?: string
  notes?: string
  tipAmount?: number
  discountCode?: string
}

// Payment types
export interface Payment {
  id: number
  orderId: number
  provider: string
  providerPaymentId?: string
  paymentIntentId?: string
  clientSecret?: string
  paymentMethod: string
  amount: number
  currency: string
  status: PaymentStatus
  refundAmount?: number
  createdAt: string
  confirmedAt?: string
  refundedAt?: string
}

export interface CreatePaymentRequest {
  paymentMethod: string
  returnUrl?: string
  metadata?: string
}

export interface CancelOrderRequest {
  reason: string
  requestRefund?: boolean
}

// Dashboard types
export type TrendDirection = 'UP' | 'DOWN' | 'STABLE'
export type SystemHealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY'
export type StuckOrderPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export interface OrderComparison {
  previousPeriodOrders: number
  changePercent: number
  percentageChange: number
  trend: TrendDirection
}

export interface SystemStatus {
  status: SystemHealthStatus
  overallHealth: SystemHealthStatus
  activeComponents: number
  totalComponents: number
  apiLatencyMs: number
  dbLoadPercent: number
  redisLatencyMs: number
  errorRate: number
  healthScore: number
}

export interface DashboardOverview {
  ordersToday: number
  revenueToday: number
  activeCouriers: number
  activeRestaurants: number
  avgDeliveryTimeMinutes: number
  orderComparison: OrderComparison
  systemStatus: SystemStatus
  generatedAt: string
}

export interface ActiveOrderItem {
  orderId: number
  orderNumber: string
  customerId: number
  customerName: string
  restaurantId: number
  restaurantName: string
  courierId?: number
  courierName?: string
  status: string
  orderStatus: string
  orderTotal: number
  createdAt: string
  estimatedDeliveryAt?: string
  deliveryAddress: string
}

export interface ActiveOrdersResponse {
  totalActiveOrders: number
  orders: ActiveOrderItem[]
  statusBreakdown: Record<string, number>
  generatedAt: string
}

export interface StuckOrderItem {
  orderId: number
  orderNumber: string
  status: string
  currentStatus: string
  minutesInCurrentStatus: number
  stuckMinutes: number
  thresholdMinutes: number
  priority: StuckOrderPriority
  priorityScore: number
  suggestedAction: string
  restaurantId: number
  restaurantName: string
  orderTotal: number
  createdAt: string
}

export interface StuckOrdersSummary {
  critical: number
  high: number
  medium: number
  low: number
}

export interface StuckOrdersResponse {
  totalStuckOrders: number
  criticalCount: number
  highCount: number
  mediumCount: number
  thresholds: Record<string, number>
  orders: StuckOrderItem[]
  summary: StuckOrdersSummary
  statusBreakdown: Record<string, number>
  generatedAt: string
}

export interface CancelledOrderItem {
  orderId: number
  orderNumber: string
  customerId: number
  customerName: string
  restaurantId: number
  restaurantName: string
  orderStatus: string
  cancelledAt: string
  cancellationReason: string
  cancelledBy: string
  refundAmount: number
  refundStatus: string
  orderTotal: number
  createdAt: string
}

export interface CancelledOrdersResponse {
  totalCancelledOrders: number
  cancelledByCustomer: number
  cancelledByRestaurant: number
  cancelledBySystem: number
  totalRefundAmount: number
  orders: CancelledOrderItem[]
  reasonBreakdown: Record<string, number>
  hourlyDistribution: Record<string, number>
  generatedAt: string
}

export interface RejectedOrderItem {
  orderId: number
  orderNumber: string
  customerId: number
  customerName: string
  restaurantId: number
  restaurantName: string
  rejectedAt: string
  rejectionReason: string
  orderTotal: number
  createdAt: string
}

export interface RejectedOrdersResponse {
  totalRejectedOrders: number
  totalLostRevenue: number
  orders: RejectedOrderItem[]
  restaurantBreakdown: Record<string, number>
  reasonBreakdown: Record<string, number>
  hourlyDistribution: Record<string, number>
  generatedAt: string
}

export interface RestaurantMetricItem {
  restaurantId: number
  name: string
  status: string
  isOnline: boolean
  rating: number
  totalOrdersToday: number
  avgPreparationTimeMinutes: number
  orderAcceptanceLatencySeconds: number
  acceptanceRate: number
  rejectedOrdersToday: number
  cuisineType?: string
  city?: string
  performanceScore: number
}

export interface RestaurantPerformanceSummary {
  avgPreparationTimeMinutes: number
  avgAcceptanceLatencySeconds: number
  avgRating: number
  avgAcceptanceRate: number
  totalOrdersProcessed: number
  rejectionRate: number
}

export interface RestaurantMetricsResponse {
  totalRestaurants: number
  onlineRestaurants: number
  offlineRestaurants: number
  busyRestaurants: number
  onlinePercentage: number
  performanceSummary: RestaurantPerformanceSummary
  restaurants: RestaurantMetricItem[]
  statusBreakdown: Record<string, number>
  cuisineDistribution: Record<string, number>
  generatedAt: string
}

export interface CourierMetricItem {
  courierId: number
  name: string
  status: string
  isActive: boolean
  rating: number
  deliveriesToday: number
  avgDeliveryTimeMinutes: number
  onTimeDeliveryRate: number
  vehicleType: string
  currentLatitude?: number
  currentLongitude?: number
  currentOrderId?: number
  performanceScore: number
}

export interface CourierLocation {
  courierId: number
  courierName: string
  latitude: number
  longitude: number
  status: string
  currentOrderId?: number
  lastPingAt: string
}

export interface CourierPerformanceSummary {
  avgDeliveryTimeMinutes: number
  avgRating: number
  totalDeliveriesToday: number
  onTimeDeliveryRate: number
  avgDeliveriesPerCourier: number
  avgDistancePerDeliveryKm: number
}

export interface CourierMetricsResponse {
  totalCouriers: number
  activeCouriers: number
  onDeliveryCouriers: number
  availableCouriers: number
  offlineCouriers: number
  activePercentage: number
  utilizationRate: number
  performanceSummary: CourierPerformanceSummary
  couriers: CourierMetricItem[]
  courierLocations: CourierLocation[]
  statusBreakdown: Record<string, number>
  vehicleDistribution: Record<string, number>
  generatedAt: string
}

export interface DailyRevenueItem {
  date: string
  gmv: number
  commissionRevenue: number
  deliveryFeeRevenue: number
  discounts: number
  orderCount: number
  avgOrderValue: number
}

export interface PayoutSummary {
  totalRestaurantPayouts: number
  totalCourierPayouts: number
  pendingRestaurantPayouts: number
  pendingCourierPayouts: number
  completedPayoutsCount: number
  avgSettlementTimeHours: number
}

export interface DiscountSummary {
  totalDiscounts: number
  ordersWithDiscount: number
  discountUsageRate: number
  avgDiscountPerOrder: number
  discountByType: Record<string, number>
}

export interface RefundSummary {
  totalRefundAmount: number
  refundCount: number
  approvedRefunds: number
  pendingRefunds: number
  approvalRate: number
  refundByReason: Record<string, number>
}

export interface FinanceMetricsResponse {
  gmv: number
  commissionRevenue: number
  deliveryFeeRevenue: number
  totalRevenue: number
  netRevenue: number
  restaurantPayouts: number
  courierPayouts: number
  discountsUsed: number
  refundsPaid: number
  unsettledRestaurantPayouts: number
  unsettledCourierPayouts: number
  totalOrders: number
  avgOrderValue: number
  commissionRate: number
  payoutSummary: PayoutSummary
  discountSummary: DiscountSummary
  refundSummary: RefundSummary
  dailyRevenue: DailyRevenueItem[]
  paymentMethodBreakdown: Record<string, number>
  generatedAt: string
}

export interface SupportTicketItem {
  ticketId: number
  ticketNumber: string
  customerId: number
  customerName: string
  orderId?: number
  category: string
  priority: string
  status: string
  subject: string
  createdAt: string
  assignedAgentId?: number
  assignedAgentName?: string
  waitTimeMinutes: number
  waitTimeFormatted: string
  slaBreached: boolean
}

export interface AgentPerformance {
  agentId: number
  agentName: string
  ticketsHandled: number
  ticketsResolved: number
  resolutionRate: number
  avgResolutionTimeMinutes: number
  avgSatisfactionScore: number
  performanceScore: number
}

export interface CommonIssue {
  category: string
  subcategory: string
  count: number
  percentage: number
  avgResolutionTimeMinutes: number
  trend: TrendDirection
}

export interface SlaMetrics {
  totalTickets: number
  slaMetTickets: number
  slaBreachedTickets: number
  slaComplianceRate: number
}

export interface SupportMetricsResponse {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  closedTickets: number
  escalatedTickets: number
  complaintCount: number
  refundRequestCount: number
  inquiryCount: number
  feedbackCount: number
  avgResolutionTimeMinutes: number
  avgResolutionTimeFormatted: string
  avgFirstResponseTimeMinutes: number
  avgFirstResponseTimeFormatted: string
  customerSatisfactionScore: number
  resolutionRate: number
  tickets: SupportTicketItem[]
  statusBreakdown: Record<string, number>
  priorityBreakdown: Record<string, number>
  agentPerformance: AgentPerformance[]
  commonIssues: CommonIssue[]
  slaMetrics: SlaMetrics
  generatedAt: string
}

// Legacy types for backward compatibility
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

// Image types
export type ImageCategory = 'restaurants' | 'menu-items' | 'profiles' | 'documents'

export interface ImageUploadResponse {
  filename: string
  originalFilename: string
  url: string
  size: number
  contentType: string
}

export interface ImageDeleteResponse {
  success: boolean
  message: string
}
