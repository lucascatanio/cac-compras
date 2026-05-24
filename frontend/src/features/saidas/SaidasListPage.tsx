import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpFromLine, Eye, Plus } from 'lucide-react'
import { useSaidas } from './hooks'
import { useSetores } from '@/features/setores/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatData, formatMoeda } from '@/lib/format'

const PAGE_SIZE = 10

export default function SaidasListPage() {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [idSetor, setIdSetor] = useState('')
  const [filtroAplicado, setFiltroAplicado] = useState({
    dataInicio: '',
    dataFim: '',
    idSetor: '',
  })
  const [pagina, setPagina] = useState(1)

  const { data: setoresData } = useSetores({ ativo: true })
  const setores = setoresData ?? []

  const params = useMemo(
    () => ({
      dataInicio: filtroAplicado.dataInicio || undefined,
      dataFim: filtroAplicado.dataFim || undefined,
      idSetor: filtroAplicado.idSetor ? Number(filtroAplicado.idSetor) : undefined,
      pagina,
      tamanhoPagina: PAGE_SIZE,
    }),
    [filtroAplicado, pagina]
  )

  const { data, isLoading, isFetching } = useSaidas(params)

  const total = data?.total ?? 0
  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function handleBuscar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPagina(1)
    setFiltroAplicado({ dataInicio, dataFim, idSetor })
  }

  function handleLimpar() {
    setDataInicio('')
    setDataFim('')
    setIdSetor('')
    setFiltroAplicado({ dataInicio: '', dataFim: '', idSetor: '' })
    setPagina(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Saídas de estoque</h1>
          <p className="text-sm text-muted-foreground">
            Consulte e registre saídas de produtos do estoque.
          </p>
        </div>

        <Button asChild>
          <Link to="/saidas/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova saída
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBuscar} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
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

            <div className="space-y-2">
              <label htmlFor="setor" className="text-sm font-medium">
                Setor
              </label>
              <select
                id="setor"
                value={idSetor}
                onChange={(e) => setIdSetor(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {setores.map((s) => (
                  <option key={s.idSetor} value={String(s.idSetor)}>
                    {s.nome}
                  </option>
                ))}
              </select>
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
          <CardTitle>Lista de saídas</CardTitle>
          {isFetching && !isLoading && (
            <span className="text-sm text-muted-foreground">Atualizando...</span>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Carregando saídas...
            </div>
          ) : !data || data.itens.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <ArrowUpFromLine className="h-10 w-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">Nenhuma saída encontrada.</p>
                <p className="text-sm text-muted-foreground">
                  Ajuste os filtros ou registre uma nova saída.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">Data</th>
                      <th className="px-4 py-3 text-left font-medium">Setor</th>
                      <th className="px-4 py-3 text-center font-medium">Itens</th>
                      <th className="px-4 py-3 text-right font-medium">Valor total</th>
                      <th className="px-4 py-3 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.itens.map((saida) => (
                      <tr key={saida.idSaida} className="border-b last:border-b-0">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatData(saida.dataSaida)}
                        </td>
                        <td className="px-4 py-3">{saida.setor}</td>
                        <td className="px-4 py-3 text-center">{saida.qtdItens}</td>
                        <td className="px-4 py-3 text-right">
                          {saida.valorTotal != null
                            ? formatMoeda(saida.valorTotal)
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/saidas/${saida.idSaida}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Detalhe
                              </Link>
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
    </div>
  )
}
