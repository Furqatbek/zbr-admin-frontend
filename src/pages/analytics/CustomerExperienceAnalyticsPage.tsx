import { useState } from 'react'
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  AlertTriangle,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
import { SimpleBarChart, SimpleLineChart } from '@/components/charts'
import { formatNumber } from '@/lib/utils'

// Mock data
const mockCXData = {
  averageRating: 4.6,
  totalReviews: 12450,
  npsScore: 72,
  complaintsCount: 156,
  resolutionRate: 94.2,
  ratingDistribution: [
    { rating: 5, count: 7470 },
    { rating: 4, count: 3112 },
    { rating: 3, count: 1120 },
    { rating: 2, count: 498 },
    { rating: 1, count: 250 },
  ],
  topComplaints: [
    { type: 'Долгая доставка', count: 45 },
    { type: 'Холодная еда', count: 32 },
    { type: 'Неполный заказ', count: 28 },
    { type: 'Качество упаковки', count: 21 },
    { type: 'Ошибка в заказе', count: 18 },
    { type: 'Поведение курьера', count: 12 },
  ],
  satisfactionTrend: [
    { date: '01.01', score: 4.5 },
    { date: '02.01', score: 4.6 },
    { date: '03.01', score: 4.4 },
    { date: '04.01', score: 4.7 },
    { date: '05.01', score: 4.6 },
    { date: '06.01', score: 4.8 },
    { date: '07.01', score: 4.7 },
    { date: '08.01', score: 4.5 },
    { date: '09.01', score: 4.6 },
    { date: '10.01', score: 4.6 },
    { date: '11.01', score: 4.7 },
    { date: '12.01', score: 4.6 },
    { date: '13.01', score: 4.8 },
    { date: '14.01', score: 4.6 },
  ],
  recentReviews: [
    { id: 1, user: 'Анна М.', rating: 5, comment: 'Отличный сервис, доставка быстрая!', date: '14.01.2024' },
    { id: 2, user: 'Петр К.', rating: 4, comment: 'Хорошая еда, но немного остыла', date: '14.01.2024' },
    { id: 3, user: 'Елена С.', rating: 5, comment: 'Всё супер, рекомендую!', date: '13.01.2024' },
    { id: 4, user: 'Иван Д.', rating: 3, comment: 'Долго ждал курьера', date: '13.01.2024' },
    { id: 5, user: 'Мария В.', rating: 5, comment: 'Очень вкусно и быстро', date: '12.01.2024' },
  ],
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-[hsl(var(--muted-foreground))]'
          }`}
        />
      ))}
    </div>
  )
}

export function CustomerExperienceAnalyticsPage() {
  const [period, setPeriod] = useState('month')
  const data = mockCXData

  const totalRatings = data.ratingDistribution.reduce((sum, r) => sum + r.count, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Клиентский опыт</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Рейтинги, отзывы и удовлетворённость клиентов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="quarter">Квартал</option>
            <option value="year">Год</option>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                <p className="text-3xl font-bold">{data.averageRating}</p>
              </div>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Средний рейтинг</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{formatNumber(data.totalReviews)}</p>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Всего отзывов</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[hsl(var(--success))]">{data.npsScore}</p>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">NPS Score</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[hsl(var(--warning))]">{data.complaintsCount}</p>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Жалоб</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[hsl(var(--success))]">{data.resolutionRate}%</p>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Решено</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Распределение оценок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.ratingDistribution.map((item) => (
                <div key={item.rating} className="flex items-center gap-3">
                  <div className="flex w-16 items-center gap-1">
                    <span className="font-medium">{item.rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="h-4 w-full rounded-full bg-[hsl(var(--muted))]">
                      <div
                        className="h-full rounded-full bg-yellow-400"
                        style={{ width: `${(item.count / totalRatings) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-20 text-right text-sm text-[hsl(var(--muted-foreground))]">
                    {formatNumber(item.count)} ({((item.count / totalRatings) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Satisfaction Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Динамика удовлетворённости
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleLineChart
              data={data.satisfactionTrend.map((d) => ({
                label: d.date,
                value: d.score * 20, // Scale to percentage
              }))}
              height={200}
              color="hsl(var(--success))"
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Complaints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Основные жалобы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart
            data={data.topComplaints.map((c) => ({
              label: c.type,
              value: c.count,
              color: 'hsl(var(--warning))',
            }))}
            height={200}
            valueFormatter={(v) => formatNumber(v)}
          />
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Последние отзывы
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Оценка</TableHead>
                <TableHead>Комментарий</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.user}</TableCell>
                  <TableCell>
                    <StarRating rating={review.rating} />
                  </TableCell>
                  <TableCell className="max-w-md truncate">{review.comment}</TableCell>
                  <TableCell>{review.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Positive vs Negative */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--success))]/10">
                <ThumbsUp className="h-7 w-7 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[hsl(var(--success))]">
                  {formatNumber(data.ratingDistribution[0].count + data.ratingDistribution[1].count)}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Положительных отзывов (4-5 звёзд)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--destructive))]/10">
                <ThumbsDown className="h-7 w-7 text-[hsl(var(--destructive))]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[hsl(var(--destructive))]">
                  {formatNumber(data.ratingDistribution[3].count + data.ratingDistribution[4].count)}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Отрицательных отзывов (1-2 звезды)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
