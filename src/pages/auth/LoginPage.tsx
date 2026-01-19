import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Введите email или телефон'),
  password: z.string().min(1, 'Введите пароль'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    clearError()
    try {
      await login(data)
      navigate('/')
    } catch {
      // Error is handled by the store
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--muted))] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--primary))]">
            <LogIn className="h-6 w-6 text-[hsl(var(--primary-foreground))]" />
          </div>
          <CardTitle className="text-2xl font-bold">Вход в систему</CardTitle>
          <CardDescription>
            Панель управления ZBR Admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="emailOrPhone" required>
                Email или телефон
              </Label>
              <Input
                id="emailOrPhone"
                type="text"
                placeholder="admin@example.com"
                {...register('emailOrPhone')}
                error={errors.emailOrPhone?.message}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" required>
                Пароль
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  className="pr-10"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
            <p>Тестовые данные:</p>
            <p className="mt-1">
              <span className="font-medium">admin@fooddelivery.com</span> / <span className="font-medium">password</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
