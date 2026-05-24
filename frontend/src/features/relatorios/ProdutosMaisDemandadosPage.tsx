import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { useProdutosMaisDemandados } from './hooks'
import { useGrupos } from '@/features/grupos/hooks'
import { useSetores } from '@/features/setores/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatData, formatMoeda, formatNumero } from '@/lib/format'
import type { ProdutosMaisDemandadosParams } from '@/types/api'

const STATUS_CLASSES: Record<string, string> = {
  'EM FALTA': 'text-red-600 font-medium',
  BAIXO: 'text-amber-600 font-medium',
  OK: 'text-green-600',
}

export default function ProdutosMaisDemandadosPage() {
  const [topN, setTopN] = useState('10')
  const [criterio, setCriterio] = useState('VALOR')
  const [idGrupo, setIdGrupo] = useState('')
  const [idSetor, setIdSetor] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [filtro, setFiltro] = useState<ProdutosMaisDemandadosParams | null>(null)

  const { data: grupos = [] } = useGrupos({})
  const { data: setores = [] } = useSetores({ ativo: true })

  const { data, isLoading, isError } = useProdutosMaisDemandados(filtro ?? {}, filtro !== null)

  function handleGerar(e: React.FormEvent) {
    e.preventDefault()
    setFiltro({
      topN: topN ? Number(topN) : 10,
      criterio: criterio || 'VALOR',
      idGrupo: idGrupo ? Number(idGrupo) : undefined,
      idSetor: idSetor ? Number(idSetor) : undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
    })
  }

  function handleLimpar() {
    setTopN('10')
    setCriterio('VALOR')
    setIdGrupo('')
    setIdSetor('')
    setDataInicio('')
    setDataFim('')
    setFiltro(null)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Produtos Mais Demandados</h1>
        <p className="text-sm text-muted-foreground">
          Ranking dos produtos com maior consumo no período, com métricas de estoque.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGerar} className="grid gap-4 md:grid-cols-[auto_auto_1fr_1fr_1fr_1fr_auto]">
            <div className="space-y-2">
              <label htmlFor="topN" className="text-sm font-medium">
                Top N
              </label>
              <Input
                id="topN"
                type="number"
                min={1}
                max={100}
                value={topN}
                onChange={(e) => setTopN(e.target.value)}
                className="w-20"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="criterio" className="text-sm font-medium">
                Critério
              </label>
              <select
                id="criterio"
                value={criterio}
                onChange={(e) => setCriterio(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="VALOR">Valor</option>
                <option value="QUANTIDADE">Quantidade</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="grupo" className="text-sm font-medium">
                Grupo
              </label>
              <select
                id="grupo"
                value={idGrupo}
                onChange={(e) => setIdGrupo(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {grupos.map((g) => (
                  <option key={g.idGrupo} value={String(g.idGrupo)}>
                    {g.nome}
                  </option>
                ))}
              </select>
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
              <Button type="submit">Gerar</Button>
              <Button type="button" variant="outline" onClick={handleLimpar}>
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          {filtro === null ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <TrendingUp className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Selecione os filtros e clique em Gerar para visualizar o relatório.
              </p>
            </div>
          ) : isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Gerando relatório...
            </div>
          ) : isError ? (
            <div className="py-10 text-center text-sm text-destructive">
              Erro ao carregar o relatório. Tente novamente.
            </div>
          ) : !data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <TrendingUp className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Nenhum registro encontrado.</p>
              <p className="text-sm text-muted-foreground">
                Não há consumo registrado para os filtros informados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">#</th>
                    <th className="px-4 py-3 text-left font-medium">Produto</th>
                    <th className="px-4 py-3 text-left font-medium">Grupo</th>
                    <th className="px-4 py-3 text-left font-medium">Unidade</th>
                    <th className="px-4 py-3 text-right font-medium">Qtd. Consumida</th>
                    <th className="px-4 py-3 text-right font-medium">Valor Consumido</th>
                    <th className="px-4 py-3 text-right font-medium">Setores</th>
                    <th className="px-4 py-3 text-right font-medium">Saídas</th>
                    <th className="px-4 py-3 text-right font-medium">Saldo Atual</th>
                    <th className="px-4 py-3 text-left font-medium">Última Saída</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={row.idProduto} className="border-b last:border-b-0">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{row.produto}</td>
                      <td className="px-4 py-3">{row.grupo}</td>
                      <td className="px-4 py-3">{row.unidadeMedida}</td>
                      <td className="px-4 py-3 text-right">{formatNumero(row.qtdTotalConsumida)}</td>
                      <td className="px-4 py-3 text-right">{formatMoeda(row.valorTotalConsumido)}</td>
                      <td className="px-4 py-3 text-right">{row.setoresConsumidores}</td>
                      <td className="px-4 py-3 text-right">{row.numSaidas}</td>
                      <td className="px-4 py-3 text-right">{formatNumero(row.saldoAtual)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.ultimaSaida ? formatData(row.ultimaSaida) : '—'}
                      </td>
                      <td className={`px-4 py-3 ${STATUS_CLASSES[row.statusEstoque] ?? ''}`}>
                        {row.statusEstoque}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
