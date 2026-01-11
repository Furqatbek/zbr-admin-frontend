import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  X,
  Eye,
  User,
  Calendar,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Avatar,
  Modal,
  ModalFooter,
} from '@/components/ui'
import { formatDateTime } from '@/lib/utils'
import type { Courier } from '@/types'

// Mock pending couriers
const mockPendingCouriers: (Courier & { appliedAt: string; documents?: string[] })[] = [
  {
    id: 4,
    userId: 15,
    userName: 'Николай Федоров',
    status: 'PENDING_APPROVAL',
    verified: false,
    rating: 0,
    totalDeliveries: 0,
    appliedAt: '2024-01-14T10:00:00Z',
    documents: ['passport.jpg', 'license.jpg'],
  },
  {
    id: 6,
    userId: 20,
    userName: 'Андрей Волков',
    status: 'PENDING_APPROVAL',
    verified: false,
    rating: 0,
    totalDeliveries: 0,
    appliedAt: '2024-01-15T09:00:00Z',
    documents: ['passport.jpg'],
  },
]

export function CourierVerificationPage() {
  const [pendingCouriers, setPendingCouriers] = useState(mockPendingCouriers)
  const [selectedCourier, setSelectedCourier] = useState<typeof mockPendingCouriers[0] | null>(null)
  const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject'; courier: typeof mockPendingCouriers[0] } | null>(null)

  const handleApprove = () => {
    if (actionModal?.courier) {
      console.log('Approving courier:', actionModal.courier.id)
      setPendingCouriers((prev) => prev.filter((c) => c.id !== actionModal.courier.id))
      setActionModal(null)
      setSelectedCourier(null)
    }
  }

  const handleReject = () => {
    if (actionModal?.courier) {
      console.log('Rejecting courier:', actionModal.courier.id)
      setPendingCouriers((prev) => prev.filter((c) => c.id !== actionModal.courier.id))
      setActionModal(null)
      setSelectedCourier(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link to="/couriers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Верификация курьеров</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Проверка заявок на работу курьером
          </p>
        </div>
      </div>

      {pendingCouriers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-[hsl(var(--success))]" />
            <h3 className="mt-4 text-lg font-semibold">Все заявки обработаны</h3>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">
              Нет курьеров, ожидающих верификации
            </p>
            <Link to="/couriers">
              <Button className="mt-4">Вернуться к списку</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pending list */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Заявки</span>
                <Badge variant="warning">{pendingCouriers.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[hsl(var(--border))]">
                {pendingCouriers.map((courier) => (
                  <button
                    key={courier.id}
                    onClick={() => setSelectedCourier(courier)}
                    className={`w-full p-4 text-left transition-colors hover:bg-[hsl(var(--muted))] ${
                      selectedCourier?.id === courier.id ? 'bg-[hsl(var(--muted))]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={courier.userName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{courier.userName}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {formatDateTime(courier.appliedAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Details panel */}
          <Card className="lg:col-span-2">
            {selectedCourier ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Детали заявки</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setActionModal({ type: 'reject', courier: selectedCourier })}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Отклонить
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => setActionModal({ type: 'approve', courier: selectedCourier })}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Одобрить
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Courier info */}
                  <div className="flex items-center gap-4">
                    <Avatar name={selectedCourier.userName} size="lg" />
                    <div>
                      <h3 className="text-xl font-semibold">{selectedCourier.userName}</h3>
                      <p className="text-[hsl(var(--muted-foreground))]">
                        ID курьера: {selectedCourier.id}
                      </p>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                      <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                        <User className="h-4 w-4" />
                        <span className="text-sm">User ID</span>
                      </div>
                      <p className="mt-2 font-medium">{selectedCourier.userId}</p>
                    </div>
                    <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                      <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Дата заявки</span>
                      </div>
                      <p className="mt-2 font-medium">{formatDateTime(selectedCourier.appliedAt)}</p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="mb-3 font-semibold">Загруженные документы</h4>
                    {selectedCourier.documents && selectedCourier.documents.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {selectedCourier.documents.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3"
                          >
                            <span className="text-sm">{doc}</span>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[hsl(var(--muted-foreground))]">Документы не загружены</p>
                    )}
                  </div>

                  {/* User profile link */}
                  <Link to={`/users/${selectedCourier.userId}`}>
                    <Button variant="outline" className="w-full">
                      Открыть профиль пользователя
                    </Button>
                  </Link>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex h-[400px] items-center justify-center text-[hsl(var(--muted-foreground))]">
                Выберите заявку для просмотра
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Action modal */}
      <Modal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal?.type === 'approve' ? 'Подтверждение' : 'Отклонение'}
        description={
          actionModal?.type === 'approve'
            ? `Вы уверены, что хотите одобрить заявку ${actionModal?.courier.userName}?`
            : `Вы уверены, что хотите отклонить заявку ${actionModal?.courier.userName}?`
        }
        size="sm"
      >
        <p className="text-sm">
          {actionModal?.type === 'approve'
            ? 'После одобрения курьер сможет принимать заказы на доставку.'
            : 'После отклонения курьер не сможет работать на платформе.'}
        </p>
        <ModalFooter>
          <Button variant="outline" onClick={() => setActionModal(null)}>
            Отмена
          </Button>
          {actionModal?.type === 'approve' ? (
            <Button variant="success" onClick={handleApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Одобрить
            </Button>
          ) : (
            <Button variant="destructive" onClick={handleReject}>
              <X className="mr-2 h-4 w-4" />
              Отклонить
            </Button>
          )}
        </ModalFooter>
      </Modal>
    </div>
  )
}
