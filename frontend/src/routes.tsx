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
import UsuariosListPage from '@/features/usuarios/UsuariosListPage'
import UsuarioFormPage from '@/features/usuarios/UsuarioFormPage'
import EntradasListPage from '@/features/entradas/EntradasListPage'
import EntradaFormPage from '@/features/entradas/EntradaFormPage'
import EntradaDetailPage from '@/features/entradas/EntradaDetailPage'
import SaidasListPage from '@/features/saidas/SaidasListPage'
import SaidaFormPage from '@/features/saidas/SaidaFormPage'
import SaidaDetailPage from '@/features/saidas/SaidaDetailPage'
import ConsumoPorSetorPage from '@/features/relatorios/ConsumoPorSetorPage'
import FichaProdutoPage from '@/features/relatorios/FichaProdutoPage'
import FornecedoresPorProdutoPage from '@/features/relatorios/FornecedoresPorProdutoPage'
import ProdutosEmFaltaPage from '@/features/relatorios/ProdutosEmFaltaPage'
import MenorPrecoPage from '@/features/relatorios/MenorPrecoPage'
import ProdutosMaisDemandadosPage from '@/features/relatorios/ProdutosMaisDemandadosPage'
import ComparativoPrecosPage from '@/features/relatorios/ComparativoPrecosPage'
import CurvaABCPage from '@/features/relatorios/CurvaABCPage'
import HistoricoPrecosPage from '@/features/relatorios/HistoricoPrecosPage'

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

const usuariosRoles = ['TI']

const entradasRoles = ['COMPRADOR', 'ALMOXARIFE', 'GERENTE_COMPRAS', 'TI']
const saidasRoles = ['ALMOXARIFE', 'GESTOR_SETOR', 'GERENTE_COMPRAS', 'TI']

const r1Roles = ['GESTOR_SETOR', 'GERENTE_COMPRAS', 'DIRETOR', 'FINANCEIRO', 'TI']
const r2Roles = ['COMPRADOR', 'ALMOXARIFE', 'GERENTE_COMPRAS', 'FINANCEIRO', 'TI']
const r3Roles = ['COMPRADOR', 'ALMOXARIFE', 'GERENTE_COMPRAS', 'TI']
const r4Roles = ['COMPRADOR', 'ALMOXARIFE', 'GERENTE_COMPRAS', 'DIRETOR', 'TI']
const r5Roles = ['COMPRADOR', 'GERENTE_COMPRAS', 'FINANCEIRO', 'TI']
const r6Roles = ['COMPRADOR', 'ALMOXARIFE', 'GERENTE_COMPRAS', 'DIRETOR', 'FINANCEIRO', 'TI']
const r7Roles = ['COMPRADOR', 'GERENTE_COMPRAS', 'FINANCEIRO', 'TI']
const r8Roles = ['GERENTE_COMPRAS', 'DIRETOR', 'FINANCEIRO', 'TI']
const r9Roles = ['COMPRADOR', 'GERENTE_COMPRAS', 'FINANCEIRO', 'TI']

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
          {
            element: <RequireRole roles={usuariosRoles} />,
            children: [
              { path: '/usuarios', element: <UsuariosListPage /> },
              { path: '/usuarios/novo', element: <UsuarioFormPage /> },
              { path: '/usuarios/:id', element: <UsuarioFormPage /> },
            ],
          },
          {
            element: <RequireRole roles={entradasRoles} />,
            children: [
              { path: '/entradas', element: <EntradasListPage /> },
              { path: '/entradas/nova', element: <EntradaFormPage /> },
              { path: '/entradas/:id', element: <EntradaDetailPage /> },
            ],
          },
          {
            element: <RequireRole roles={saidasRoles} />,
            children: [
              { path: '/saidas', element: <SaidasListPage /> },
              { path: '/saidas/nova', element: <SaidaFormPage /> },
              { path: '/saidas/:id', element: <SaidaDetailPage /> },
            ],
          },
          {
            element: <RequireRole roles={r1Roles} />,
            children: [
              { path: '/relatorios/consumo-por-setor', element: <ConsumoPorSetorPage /> },
            ],
          },
          {
            element: <RequireRole roles={r2Roles} />,
            children: [
              { path: '/relatorios/ficha-produto', element: <FichaProdutoPage /> },
            ],
          },
          {
            element: <RequireRole roles={r3Roles} />,
            children: [
              { path: '/relatorios/fornecedores-por-produto', element: <FornecedoresPorProdutoPage /> },
            ],
          },
          {
            element: <RequireRole roles={r4Roles} />,
            children: [
              { path: '/relatorios/produtos-em-falta', element: <ProdutosEmFaltaPage /> },
            ],
          },
          {
            element: <RequireRole roles={r5Roles} />,
            children: [
              { path: '/relatorios/menor-preco', element: <MenorPrecoPage /> },
            ],
          },
          {
            element: <RequireRole roles={r6Roles} />,
            children: [
              { path: '/relatorios/produtos-mais-demandados', element: <ProdutosMaisDemandadosPage /> },
            ],
          },
          {
            element: <RequireRole roles={r7Roles} />,
            children: [
              { path: '/relatorios/comparativo-precos', element: <ComparativoPrecosPage /> },
            ],
          },
          {
            element: <RequireRole roles={r8Roles} />,
            children: [
              { path: '/relatorios/curva-abc', element: <CurvaABCPage /> },
            ],
          },
          {
            element: <RequireRole roles={r9Roles} />,
            children: [
              { path: '/relatorios/historico-precos', element: <HistoricoPrecosPage /> },
            ],
          },
        ],
      },
    ],
  },
])