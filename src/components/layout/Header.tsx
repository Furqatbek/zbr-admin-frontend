import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, User, ChevronDown, Search } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { Avatar, Badge, Button, Input, ThemeToggle } from '@/components/ui'

export function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userName = user?.fullName || 'Пользователь'
  const userRole = user?.roles[0] || 'USER'

  const roleLabels: Record<string, string> = {
    ADMIN: 'Администратор',
    PLATFORM: 'Платформа',
    CONSUMER: 'Потребитель',
    RESTAURANT_OWNER: 'Владелец ресторана',
    COURIER: 'Курьер',
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <Input
            type="search"
            placeholder="Поиск..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--destructive))] text-[10px] font-medium text-[hsl(var(--destructive-foreground))]">
            3
          </span>
        </Button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[hsl(var(--muted))]"
          >
            <Avatar name={userName} size="sm" />
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {roleLabels[userRole] || userRole}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-1 shadow-lg">
              <div className="border-b border-[hsl(var(--border))] px-4 py-3">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{user?.email}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {user?.roles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {roleLabels[role] || role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="py-1">
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                  onClick={() => {
                    setIsDropdownOpen(false)
                    // Navigate to profile
                  }}
                >
                  <User className="h-4 w-4" />
                  Профиль
                </button>
              </div>

              <div className="border-t border-[hsl(var(--border))] py-1">
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[hsl(var(--destructive))] hover:bg-[hsl(var(--muted))]"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Выйти
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
