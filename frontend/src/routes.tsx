import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import LoginPage from '@/features/auth/LoginPage'
import AppLayout from '@/components/layout/AppLayout'
import DashboardPage from '@/features/dashboard/DashboardPage'
import FornecedoresListPage from '@/features/fornecedores/FornecedoresListPage'
import FornecedorFormPage from '@/features/fornecedores/FornecedorFormPage'
import GruposListPage from '@/features/grupos/GruposListPage'
import GrupoFormPage from '@/features/grupos/GrupoFormPage'
import ProdutosListPage from '@/features/produtos/ProdutosListPage'
import ProdutoFormPage from '@/features/produtos/ProdutoFormPage'
import SetoresListPage from '@/features/setores/SetoresListPage'
import SetorFormPage from '@/features/setores/SetorFormPage'

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

const fornecedoresLeituraRoles = ['COMPRADOR', 'ALMOXARIFE', 'GERENTE_COMPRAS', 'TI']
const fornecedoresEscritaRoles = ['COMPRADOR', 'GERENTE_COMPRAS', 'TI']

const gruposEscritaRoles = ['ALMOXARIFE', 'GERENTE_COMPRAS', 'TI']

const setoresEscritaRoles = ['GERENTE_COMPRAS', 'TI']

const produtosLeituraRoles = ['COMPRADOR', 'ALMOXARIFE', 'GESTOR_SETOR', 'GERENTE_COMPRAS', 'TI']
const produtosEscritaRoles = ['ALMOXARIFE', 'GERENTE_COMPRAS', 'TI']

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
          {
            element: <RequireRole roles={fornecedoresLeituraRoles} />,
            children: [
              { path: '/fornecedores', element: <FornecedoresListPage /> },
            ],
          },
          {
            element: <RequireRole roles={fornecedoresEscritaRoles} />,
            children: [
              { path: '/fornecedores/novo', element: <FornecedorFormPage /> },
              { path: '/fornecedores/:id', element: <FornecedorFormPage /> },
            ],
          },
          { path: '/grupos', element: <GruposListPage /> },
          {
            element: <RequireRole roles={gruposEscritaRoles} />,
            children: [
              { path: '/grupos/novo', element: <GrupoFormPage /> },
              { path: '/grupos/:id', element: <GrupoFormPage /> },
            ],
          },
          { path: '/setores', element: <SetoresListPage /> },
          {
            element: <RequireRole roles={setoresEscritaRoles} />,
            children: [
              { path: '/setores/novo', element: <SetorFormPage /> },
              { path: '/setores/:id', element: <SetorFormPage /> },
            ],
          },
          {
            element: <RequireRole roles={produtosLeituraRoles} />,
            children: [
              { path: '/produtos', element: <ProdutosListPage /> },
            ],
          },
          {
            element: <RequireRole roles={produtosEscritaRoles} />,
            children: [
              { path: '/produtos/novo', element: <ProdutoFormPage /> },
              { path: '/produtos/:id', element: <ProdutoFormPage /> },
            ],
          },
        ],
      },
    ],
  },
])