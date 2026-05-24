import { Moon, Sun, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'

export function Header() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const { usuario, clearAuth } = useAuthStore()

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-6 shrink-0">
      <div />

      <div className="flex items-center gap-4">
        <div className="text-sm text-right leading-tight hidden sm:block">
          <p className="font-medium">{usuario?.nomeCompleto}</p>
          <p className="text-muted-foreground text-xs">{usuario?.perfilNome}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
