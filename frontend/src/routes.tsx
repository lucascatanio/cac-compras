import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import LoginPage from '@/features/auth/LoginPage'
import AppLayout from '@/components/layout/AppLayout'
import DashboardPage from '@/features/dashboard/DashboardPage'

/** Bloqueia rotas que exigem login */
function RequireAuth() {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}

/** Bloqueia rotas restritas a perfis específicos */
export function RequireRole({ roles }: { roles: string[] }) {
  const perfil = useAuthStore((s) => s.usuario?.perfilCodigo)
  if (!perfil || !roles.includes(perfil)) return <Navigate to="/" replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          // Fases 3-6: rotas de cadastros, movimentações, relatórios e auditoria
        ],
      },
    ],
  },
])
