import { useMemo, useState } from 'react'
import { ShieldCheck, X } from 'lucide-react'
import { useAuditoria } from './hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatDataHora } from '@/lib/format'
import type { AuditoriaItem } from '@/types/api'

const PAGE_SIZE = 20

const OPERACOES = ['INSERT', 'UPDATE', 'DELETE']
const TABELAS = ['Produto', 'Entrada', 'Saida', 'ItemEntrada', 'ItemSaida']

function JsonModal({ item, onClose }: { item: AuditoriaItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-lg border bg-background p-6 shadow-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-lg font-semibold">
          Detalhes do log #{item.idLog}
        </h2>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-2 border-b pb-3">
            <span className="text-muted-foreground">Tabela</span>
            <span>{item.tabela}</span>
            <span className="text-muted-foreground">Operação</span>
            <span>{item.operacao}</span>
            <span className="text-muted-foreground">ID do Registro</span>
            <span>{item.idRegistro}</span>
            <span className="text-muted-foreground">Usuário</span>
            <span>{item.usuario}</span>
            <span className="text-muted-foreground">Data/Hora</span>
            <span>{formatDataHora(item.dataHora)}</span>
          </div>

          {item.dadosAnteriores && (
            <div className="space-y-1">
              <p className="font-medium">Dados anteriores</p>
              <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(JSON.parse(item.dadosAnteriores), null, 2)}
              </pre>
            </div>
          )}

          {item.dadosNovos && (
            <div className="space-y-1">
              <p className="font-medium">Dados novos</p>
              <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(JSON.parse(item.dadosNovos), null, 2)}
              </pre>
            </div>
          )}

          {!item.dadosAnteriores && !item.dadosNovos && (
            <p className="text-muted-foreground">Sem dados de payload registrados.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function operacaoBadgeClass(operacao: string) {
  switch (operacao) {
    case 'INSERT':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'DELETE':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  }
}

export default function AuditoriaPage() {
  const [tabela, setTabela] = useState('')
  const [operacao, setOperacao] = useState('')
  const [usuario, setUsuario] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [filtroAplicado, setFiltroAplicado] = useState({
    tabela: '',
    operacao: '',
    usuario: '',
    dataInicio: '',
    dataFim: '',
  })
  const [pagina, setPagina] = useState(1)
  const [itemSelecionado, setItemSelecionado] = useState<AuditoriaItem | null>(null)

  const params = useMemo(
    () => ({
      tabela: filtroAplicado.tabela || undefined,
      operacao: filtroAplicado.operacao || undefined,
      usuario: filtroAplicado.usuario || undefined,
      dataInicio: filtroAplicado.dataInicio || undefined,
      dataFim: filtroAplicado.dataFim || undefined,
      pagina,
      tamanhoPagina: PAGE_SIZE,
    }),
    [filtroAplicado, pagina]
  )

  const { data, isLoading, isFetching } = useAuditoria(params)

  const total = data?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function handleBuscar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPagina(1)
    setFiltroAplicado({ tabela, operacao, usuario, dataInicio, dataFim })
  }

  function handleLimpar() {
    setTabela('')
    setOperacao('')
    setUsuario('')
    setDataInicio('')
    setDataFim('')
    setFiltroAplicado({ tabela: '', operacao: '', usuario: '', dataInicio: '', dataFim: '' })
    setPagina(1)
  }

  const selectClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Log de auditoria</h1>
        <p className="text-sm text-muted-foreground">
          Rastreabilidade de todas as operações registradas no sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBuscar} className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="space-y-2">
              <label htmlFor="tabela" className="text-sm font-medium">
                Tabela
              </label>
              <select
                id="tabela"
                value={tabela}
                onChange={(e) => setTabela(e.target.value)}
                className={selectClass}
              >
                <option value="">Todas</option>
                {TABELAS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="operacao" className="text-sm font-medium">
                Operação
              </label>
              <select
                id="operacao"
                value={operacao}
                onChange={(e) => setOperacao(e.target.value)}
                className={selectClass}
              >
                <option value="">Todas</option>
                {OPERACOES.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="usuario" className="text-sm font-medium">
                Usuário
              </label>
              <Input
                id="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Nome ou parte do nome"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="dataInicio" className="text-sm font-medium">
                Data início
              </label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="dataFim" className="text-sm font-medium">
                Data fim
              </label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button type="submit">Buscar</Button>
              <Button type="button" variant="outline" onClick={handleLimpar}>
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Registros</CardTitle>
          {isFetching && !isLoading && (
            <span className="text-sm text-muted-foreground">Atualizando...</span>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Carregando registros...
            </div>
          ) : !data || data.itens.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <ShieldCheck className="h-10 w-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">Nenhum registro encontrado.</p>
                <p className="text-sm text-muted-foreground">Ajuste os filtros para refinar a busca.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">Data/Hora</th>
                      <th className="px-4 py-3 text-left font-medium">Tabela</th>
                      <th className="px-4 py-3 text-left font-medium">Operação</th>
                      <th className="px-4 py-3 text-center font-medium">ID registro</th>
                      <th className="px-4 py-3 text-left font-medium">Usuário</th>
                      <th className="px-4 py-3 text-right font-medium">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.itens.map((item) => (
                      <tr key={item.idLog} className="border-b last:border-b-0">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDataHora(item.dataHora)}
                        </td>
                        <td className="px-4 py-3">{item.tabela}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${operacaoBadgeClass(item.operacao)}`}
                          >
                            {item.operacao}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">{item.idRegistro}</td>
                        <td className="px-4 py-3">{item.usuario}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setItemSelecionado(item)}
                            >
                              Ver dados
                            </Button>
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

      {itemSelecionado && (
        <JsonModal item={itemSelecionado} onClose={() => setItemSelecionado(null)} />
      )}
    </div>
  )
}
