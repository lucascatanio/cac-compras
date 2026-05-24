import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Pencil, Plus, Search } from 'lucide-react'
import { useProdutos, useDefinirAtivoProduto } from './hooks'
import { useGrupos } from '@/features/grupos/hooks'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatMoeda, formatNumero } from '@/lib/format'
import type { StatusEstoque } from '@/types/api'

const PAGE_SIZE = 10

const ROLES_ESCRITA = ['ALMOXARIFE', 'GERENTE_COMPRAS', 'TI'] as const

function getAtivoParam(value: string): boolean | undefined {
  if (value === 'ativos') return true
  if (value === 'inativos') return false
  return undefined
}

const STATUS_LABEL: Record<StatusEstoque, string> = {
  EM_FALTA: 'Em falta',
  BAIXO: 'Estoque baixo',
  OK: 'OK',
}

const STATUS_CLASS: Record<StatusEstoque, string> = {
  EM_FALTA:
    'inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700',
  BAIXO:
    'inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700',
  OK: 'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700',
}

export default function ProdutosListPage() {
  const perfilCodigo = useAuthStore((s) => s.usuario?.perfilCodigo ?? '')
  const podeEscrever = ROLES_ESCRITA.includes(perfilCodigo as (typeof ROLES_ESCRITA)[number])

  const [buscaInput, setBuscaInput] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')
  const [ativoFiltro, setAtivoFiltro] = useState<'todos' | 'ativos' | 'inativos'>('todos')
  const [idGrupoFiltro, setIdGrupoFiltro] = useState<string>('')
  const [apenasEmFalta, setApenasEmFalta] = useState(false)
  const [pagina, setPagina] = useState(1)

  const { data: grupos } = useGrupos({})

  const params = useMemo(
    () => ({
      busca: buscaAplicada || undefined,
      ativo: getAtivoParam(ativoFiltro),
      idGrupo: idGrupoFiltro ? Number(idGrupoFiltro) : undefined,
      apenasEmFalta: apenasEmFalta || undefined,
      pagina,
      tamanhoPagina: PAGE_SIZE,
    }),
    [buscaAplicada, ativoFiltro, idGrupoFiltro, apenasEmFalta, pagina]
  )

  const { data, isLoading, isFetching } = useProdutos(params)
  const definirAtivoMutation = useDefinirAtivoProduto()

  const total = data?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function handleBuscar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPagina(1)
    setBuscaAplicada(buscaInput.trim())
  }

  async function handleToggleAtivo(id: number, ativoAtual: boolean) {
    await definirAtivoMutation.mutateAsync({ id, payload: { ativo: !ativoAtual } })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Consulte, cadastre, edite e ative ou inative produtos.
          </p>
        </div>

        {podeEscrever && (
          <Button asChild>
            <Link to="/produtos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo produto
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBuscar} className="grid gap-4 md:grid-cols-[1fr_180px_180px_auto]">
            <div className="space-y-2">
              <label htmlFor="busca" className="text-sm font-medium">
                Busca
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Buscar por nome"
                  value={buscaInput}
                  onChange={(e) => setBuscaInput(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="grupo" className="text-sm font-medium">
                Grupo
              </label>
              <select
                id="grupo"
                value={idGrupoFiltro}
                onChange={(e) => {
                  setIdGrupoFiltro(e.target.value)
                  setPagina(1)
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {grupos?.map((g) => (
                  <option key={g.idGrupo} value={String(g.idGrupo)}>
                    {g.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="ativo" className="text-sm font-medium">
                Situação
              </label>
              <select
                id="ativo"
                value={ativoFiltro}
                onChange={(e) => {
                  setAtivoFiltro(e.target.value as 'todos' | 'ativos' | 'inativos')
                  setPagina(1)
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="todos">Todos</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
              </select>
            </div>

            <div className="flex flex-col justify-end gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={apenasEmFalta}
                  onChange={(e) => {
                    setApenasEmFalta(e.target.checked)
                    setPagina(1)
                  }}
                  className="h-4 w-4 rounded border-input"
                />
                Apenas em falta
              </label>
              <Button type="submit" className="w-full md:w-auto">
                Buscar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Lista de produtos</CardTitle>
          {isFetching && !isLoading && (
            <span className="text-sm text-muted-foreground">Atualizando...</span>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Carregando produtos...
            </div>
          ) : !data || data.itens.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Package className="h-10 w-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">Nenhum produto encontrado.</p>
                <p className="text-sm text-muted-foreground">
                  Ajuste os filtros ou cadastre um novo produto.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">Nome</th>
                      <th className="px-4 py-3 text-left font-medium">Grupo</th>
                      <th className="px-4 py-3 text-left font-medium">Unidade</th>
                      <th className="px-4 py-3 text-right font-medium">Saldo</th>
                      <th className="px-4 py-3 text-right font-medium">Preço médio</th>
                      <th className="px-4 py-3 text-left font-medium">Estoque</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.itens.map((produto) => (
                      <tr key={produto.idProduto} className="border-b last:border-b-0">
                        <td className="px-4 py-3">
                          <div className="font-medium">{produto.nome}</div>
                          {produto.descricao && (
                            <div className="text-xs text-muted-foreground">
                              {produto.descricao}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{produto.grupoNome}</td>
                        <td className="px-4 py-3 text-muted-foreground">{produto.unidadeMedida}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatNumero(produto.saldo)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatMoeda(produto.precoMedio)}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          mín. {formatNumero(produto.estoqueMinimo)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={STATUS_CLASS[produto.statusEstoque]}>
                            {STATUS_LABEL[produto.statusEstoque]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {podeEscrever && (
                              <>
                                <Button asChild variant="outline" size="sm">
                                  <Link to={`/produtos/${produto.idProduto}`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                  </Link>
                                </Button>
                                <Button
                                  variant={produto.ativo ? 'secondary' : 'default'}
                                  size="sm"
                                  onClick={() =>
                                    handleToggleAtivo(produto.idProduto, produto.ativo)
                                  }
                                  disabled={definirAtivoMutation.isPending}
                                >
                                  {produto.ativo ? 'Inativar' : 'Ativar'}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                <p className="text-sm text-muted-foreground">Total de registros: {total}</p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagina((prev) => Math.max(1, prev - 1))}
                    disabled={pagina <= 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {pagina} de {totalPaginas}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagina((prev) => Math.min(totalPaginas, prev + 1))}
                    disabled={pagina >= totalPaginas}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
