import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  RefreshCw,
  Loader2,
  MessageSquare,
  Utensils,
  Truck,
  User,
  Tag,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Pagination,
} from '@/components/ui'
import { formatDateTime } from '@/lib/utils'
import { useRestaurant, useRestaurantReviews } from '@/hooks/useRestaurants'

function StarRating({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-[hsl(var(--muted-foreground))]">{label}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-[hsl(var(--muted-foreground))]/30'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium">{rating}</span>
    </div>
  )
}

export function RestaurantReviewsPage() {
  const { id } = useParams()
  const restaurantId = parseInt(id || '0', 10)

  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const { data: restaurantData } = useRestaurant(restaurantId)
  const restaurant = restaurantData?.data

  const {
    data: reviewsData,
    isLoading,
    isFetching,
    refetch,
  } = useRestaurantReviews(restaurantId, { page, size: pageSize })

  const reviews = reviewsData?.data?.content ?? []
  const totalElements = reviewsData?.data?.totalElements ?? 0
  const totalPages = reviewsData?.data?.totalPages ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/restaurants/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Отзывы</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            {restaurant?.name || `Ресторан #${id}`}
            {totalElements > 0 && ` — ${totalElements} отзывов`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Summary card */}
      {restaurant && (restaurant.averageRating || restaurant.totalRatings) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-[hsl(var(--primary))]">
                  {restaurant.averageRating?.toFixed(1) ?? '—'}
                </p>
                <div className="mt-1 flex items-center justify-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(restaurant.averageRating ?? 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-[hsl(var(--muted-foreground))]/30'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {restaurant.totalRatings ?? 0} оценок
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--muted-foreground))]" />
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-[hsl(var(--muted-foreground))]">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-lg font-medium">Отзывов пока нет</p>
              <p className="mt-1 text-sm">Отзывы появятся после первых заказов</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
                      <User className="h-5 w-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{review.consumerName}</CardTitle>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Заказ #{review.orderId} · {formatDateTime(review.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Ratings */}
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div className="flex items-center gap-1.5">
                    <Utensils className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <StarRating rating={review.restaurantRating} label="Ресторан" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <StarRating rating={review.foodRating} label="Еда" />
                  </div>
                  {review.courierRating != null && (
                    <div className="flex items-center gap-1.5">
                      <Truck className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <StarRating rating={review.courierRating} label="Доставка" />
                    </div>
                  )}
                </div>

                {/* Comment */}
                {review.comment && (
                  <div className="rounded-lg bg-[hsl(var(--muted))] p-4">
                    <p className="text-sm">{review.comment}</p>
                  </div>
                )}

                {/* Tags */}
                {review.tags && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <div className="flex flex-wrap gap-1">
                      {review.tags.split(',').map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalElements > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalElements}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(0)
          }}
        />
      )}
    </div>
  )
}
