import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Pencil, Plus, Search } from 'lucide-react'
import { useDefinirAtivoFornecedor, useFornecedores } from './hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const PAGE_SIZE = 10
const ROLES_ESCRITA = ['COMPRADOR', 'GERENTE_COMPRAS', 'TI'] as const

import { useAuthStore } from '@/stores/authStore'

function getAtivoParam(value: string): boolean | undefined {
  if (value === 'ativos') return true
  if (value === 'inativos') return false
  return undefined
}

export default function FornecedoresListPage() {
  const perfilCodigo = useAuthStore((s) => s.usuario?.perfilCodigo ?? '')
  const podeEscrever = ROLES_ESCRITA.includes(perfilCodigo as (typeof ROLES_ESCRITA)[number])

  const [buscaInput, setBuscaInput] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')
  const [ativoFiltro, setAtivoFiltro] = useState<'todos' | 'ativos' | 'inativos'>('todos')
  const [pagina, setPagina] = useState(1)

  const params = useMemo(
    () => ({
      busca: buscaAplicada || undefined,
      ativo: getAtivoParam(ativoFiltro),
      pagina,
      tamanhoPagina: PAGE_SIZE,
    }),
    [buscaAplicada, ativoFiltro, pagina]
  )

  const { data, isLoading, isFetching } = useFornecedores(params)
  const definirAtivoMutation = useDefinirAtivoFornecedor()

  const total = data?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function handleBuscar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPagina(1)
    setBuscaAplicada(buscaInput.trim())
  }

  async function handleToggleAtivo(id: number, ativoAtual: boolean) {
    await definirAtivoMutation.mutateAsync({
      id,
      payload: { ativo: !ativoAtual },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Fornecedores</h1>
          <p className="text-sm text-muted-foreground">
            Consulte, cadastre, edite e ative ou inative fornecedores.
          </p>
        </div>

        {podeEscrever && (
          <Button asChild>
            <Link to="/fornecedores/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo fornecedor
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBuscar} className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
            <div className="space-y-2">
              <label htmlFor="busca" className="text-sm font-medium">
                Busca
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Buscar por razão social, CNPJ ou e-mail"
                  value={buscaInput}
                  onChange={(e) => setBuscaInput(e.target.value)}
                  className="pl-9"
                />
              </div>
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

            <div className="flex items-end gap-2">
              <Button type="submit" className="w-full md:w-auto">
                Buscar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Lista de fornecedores</CardTitle>
          {isFetching && !isLoading && (
            <span className="text-sm text-muted-foreground">Atualizando...</span>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Carregando fornecedores...
            </div>
          ) : !data || data.itens.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">Nenhum fornecedor encontrado.</p>
                <p className="text-sm text-muted-foreground">
                  Ajuste os filtros ou cadastre um novo fornecedor.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">Razão social</th>
                      <th className="px-4 py-3 text-left font-medium">CNPJ</th>
                      <th className="px-4 py-3 text-left font-medium">Contato</th>
                      <th className="px-4 py-3 text-left font-medium">Cidade/UF</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.itens.map((fornecedor) => (
                      <tr key={fornecedor.idFornecedor} className="border-b last:border-b-0">
                        <td className="px-4 py-3">
                          <div className="font-medium">{fornecedor.razaoSocial}</div>
                          <div className="text-xs text-muted-foreground">{fornecedor.email ?? 'Sem e-mail'}</div>
                        </td>
                        <td className="px-4 py-3">{fornecedor.cnpj}</td>
                        <td className="px-4 py-3">{fornecedor.telefone ?? '—'}</td>
                        <td className="px-4 py-3">
                          {fornecedor.cidade && fornecedor.uf
                            ? `${fornecedor.cidade}/${fornecedor.uf}`
                            : fornecedor.cidade ?? fornecedor.uf ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              fornecedor.ativo
                                ? 'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700'
                                : 'inline-flex rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700'
                            }
                          >
                            {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {podeEscrever && (
                              <>
                                <Button asChild variant="outline" size="sm">
                                  <Link to={`/fornecedores/${fornecedor.idFornecedor}`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                  </Link>
                                </Button>
                                <Button
                                  variant={fornecedor.ativo ? 'secondary' : 'default'}
                                  size="sm"
                                  onClick={() =>
                                    handleToggleAtivo(fornecedor.idFornecedor, fornecedor.ativo)
                                  }
                                  disabled={definirAtivoMutation.isPending}
                                >
                                  {fornecedor.ativo ? 'Inativar' : 'Ativar'}
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
                <p className="text-sm text-muted-foreground">
                  Total de registros: {total}
                </p>

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