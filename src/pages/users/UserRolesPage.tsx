import {
  Shield,
  Loader2,
} from 'lucide-react'
import {
  Card,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui'
import { useRoles } from '@/hooks/useUsers'

const SYSTEM_ROLES = ['ADMIN', 'SYSTEM', 'PLATFORM']

export function UserRolesPage() {
  const { data: rolesResponse, isLoading, error } = useRoles()

  const roles = rolesResponse?.data || []

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-[hsl(var(--destructive))]">Ошибка загрузки ролей</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Роли и права</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          Управление ролями и разрешениями пользователей
        </p>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
              <Shield className="h-6 w-6 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Всего ролей</p>
              <p className="text-2xl font-bold">{roles.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Роль</TableHead>
                <TableHead>Код</TableHead>
                <TableHead>Тип</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.value}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      <p className="font-medium">{role.displayName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm text-[hsl(var(--muted-foreground))]">{role.value}</code>
                  </TableCell>
                  <TableCell>
                    {SYSTEM_ROLES.includes(role.value) ? (
                      <Badge variant="default">Системная</Badge>
                    ) : (
                      <Badge variant="secondary">Пользовательская</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
