import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Package, Layers, Building2,
  Link2, ArrowDownToLine, ArrowUpFromLine, BarChart3,
  FileText, ShieldCheck
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  to: string
  icon: React.ElementType
  roles: string[] | 'all'
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const TODOS = 'all' as const

const NAV: NavGroup[] = [
  {
    title: '',
    items: [
      { label: 'Painel', to: '/', icon: LayoutDashboard, roles: TODOS },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { label: 'Fornecedores',  to: '/fornecedores', icon: Building2,  roles: ['COMPRADOR', 'ALMOXARIFE', 'GERENTE_COMPRAS', 'TI'] },
      { label: 'Produtos',      to: '/produtos',     icon: Package,    roles: ['COMPRADOR', 'ALMOXARIFE', 'GESTOR_SETOR', 'GERENTE_COMPRAS', 'TI'] },
      { label: 'Grupos',        to: '/grupos',       icon: Layers,     roles: TODOS },
      { label: 'Setores',       to: '/setores',      icon: Building2,  roles: TODOS },
      { label: 'Usuários',      to: '/usuarios',     icon: Users,      roles: ['TI'] },
    ],
  },
  {
    title: 'Movimentações',
    items: [
      { label: 'Entradas', to: '/entradas', icon: ArrowDownToLine, roles: ['COMPRADOR', 'ALMOXARIFE', 'GERENTE_COMPRAS', 'TI'] },
      { label: 'Saídas',   to: '/saidas',   icon: ArrowUpFromLine, roles: ['ALMOXARIFE', 'GESTOR_SETOR', 'GERENTE_COMPRAS', 'TI'] },
    ],
  },
  {
    title: 'Relatórios',
    items: [
      { label: 'Consumo por Setor',     to: '/relatorios/consumo-por-setor',       icon: BarChart3,     roles: ['GESTOR_SETOR', 'GERENTE_COMPRAS', 'DIRETOR', 'FINANCEIRO', 'TI'] },
      { label: 'Ficha do Produto',      to: '/relatorios/ficha-produto',            icon: FileText,      roles: ['COMPRADOR', 'ALMOXARIFE', 'GERENTE_COMPRAS', 'FINANCEIRO', 'TI'] },
      { label: 'Fornecedores/Produto',  to: '/relatorios/fornecedores-por-produto', icon: Link2,         roles: ['COMPRADOR', 'ALMOXARIFE', 'GERENTE_COMPRAS', 'TI'] },
      { label: 'Produtos em Falta',     to: '/relatorios/produtos-em-falta',        icon: Package,       roles: ['COMPRADOR', 'ALMOXARIFE', 'GERENTE_COMPRAS', 'DIRETOR', 'TI'] },
      { label: 'Menor Preço',           to: '/relatorios/menor-preco',              icon: BarChart3,     roles: ['COMPRADOR', 'GERENTE_COMPRAS', 'FINANCEIRO', 'TI'] },
      { label: 'Mais Demandados',       to: '/relatorios/produtos-mais-demandados', icon: BarChart3,     roles: ['COMPRADOR', 'ALMOXARIFE', 'GERENTE_COMPRAS', 'DIRETOR', 'FINANCEIRO', 'TI'] },
      { label: 'Comparativo Preços',    to: '/relatorios/comparativo-precos',       icon: BarChart3,     roles: ['COMPRADOR', 'GERENTE_COMPRAS', 'FINANCEIRO', 'TI'] },
      { label: 'Curva ABC',             to: '/relatorios/curva-abc',                icon: BarChart3,     roles: ['GERENTE_COMPRAS', 'DIRETOR', 'FINANCEIRO', 'TI'] },
      { label: 'Histórico de Preços',   to: '/relatorios/historico-precos',         icon: BarChart3,     roles: ['COMPRADOR', 'GERENTE_COMPRAS', 'FINANCEIRO', 'TI'] },
    ],
  },
  {
    title: 'Administração',
    items: [
      { label: 'Auditoria', to: '/auditoria', icon: ShieldCheck,   roles: ['TI'] },
    ],
  },
]

export function Sidebar() {
  const perfilCodigo = useAuthStore((s) => s.usuario?.perfilCodigo ?? '')

  const podeVer = (roles: string[] | 'all') =>
    roles === 'all' || roles.includes(perfilCodigo)

  return (
    <aside className="w-60 shrink-0 border-r bg-background flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-5 border-b">
        <span className="font-bold text-lg tracking-tight">CAC Compras</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-5">
        {NAV.map((group) => {
          const visibleItems = group.items.filter((item) => podeVer(item.roles))
          if (visibleItems.length === 0) return null

          return (
            <div key={group.title}>
              {group.title && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                  {group.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
