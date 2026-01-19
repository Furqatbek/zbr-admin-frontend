import { Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore } from '@/store/theme.store'
import { Button } from './button'
import { Dropdown, DropdownItem } from './dropdown'

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore()

  const icons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  }

  const CurrentIcon = icons[theme]

  return (
    <Dropdown
      trigger={
        <Button variant="ghost" size="icon">
          <CurrentIcon className="h-5 w-5" />
        </Button>
      }
      align="right"
    >
      <DropdownItem onClick={() => setTheme('light')}>
        <Sun className="h-4 w-4" />
        Светлая
      </DropdownItem>
      <DropdownItem onClick={() => setTheme('dark')}>
        <Moon className="h-4 w-4" />
        Тёмная
      </DropdownItem>
      <DropdownItem onClick={() => setTheme('system')}>
        <Monitor className="h-4 w-4" />
        Системная
      </DropdownItem>
    </Dropdown>
  )
}
