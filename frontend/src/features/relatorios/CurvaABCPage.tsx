import { useState } from 'react'
import { BarChart2 } from 'lucide-react'
import { useCurvaAbc } from './hooks'
import ParetoChart from '@/components/charts/ParetoChart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoeda, formatNumero, formatPercentual } from '@/lib/format'
import type { CurvaAbcParams } from '@/types/api'

const CLASSE_BADGE: Record<string, string> = {
  A: 'inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  B: 'inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  C: 'inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

export default function CurvaABCPage() {
  const [classe, setClasse] = useState('')
  const [filtro, setFiltro] = useState<CurvaAbcParams | null>(null)

  const { data, isLoading, isError } = useCurvaAbc(filtro ?? {}, filtro !== null)

  function handleGerar(e: React.FormEvent) {
    e.preventDefault()
    setFiltro({ classe: classe || undefined })
  }

  function handleLimpar() {
    setClasse('')
    setFiltro(null)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Curva ABC</h1>
        <p className="text-sm text-muted-foreground">
          Classificação ABC dos produtos por valor consumido. Classe A: até 80% do total; B: até 95%; C: restante.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGerar} className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <label htmlFor="classe" className="text-sm font-medium">
                Classe ABC
              </label>
              <select
                id="classe"
                value={classe}
                onChange={(e) => setClasse(e.target.value)}
                className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                <option value="A">A — Alta prioridade</option>
                <option value="B">B — Média prioridade</option>
                <option value="C">C — Baixa prioridade</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Gerar</Button>
              <Button type="button" variant="outline" onClick={handleLimpar}>
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {filtro !== null && !isLoading && !isError && data && data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gráfico de Pareto</CardTitle>
          </CardHeader>
          <CardContent>
            <ParetoChart data={data} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          {filtro === null ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <BarChart2 className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Selecione o filtro e clique em Gerar para visualizar a Curva ABC.
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
              <BarChart2 className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Nenhum registro encontrado.</p>
              <p className="text-sm text-muted-foreground">
                Não há dados de consumo para gerar a Curva ABC.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Produto</th>
                    <th className="px-4 py-3 text-left font-medium">Grupo</th>
                    <th className="px-4 py-3 text-right font-medium">Qtd. Consumida</th>
                    <th className="px-4 py-3 text-right font-medium">Valor Consumido</th>
                    <th className="px-4 py-3 text-right font-medium">% Individual</th>
                    <th className="px-4 py-3 text-right font-medium">% Acumulado</th>
                    <th className="px-4 py-3 text-center font-medium">Classe</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.idProduto} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium">{row.produto}</td>
                      <td className="px-4 py-3">{row.grupo}</td>
                      <td className="px-4 py-3 text-right">{formatNumero(row.qtdTotalConsumida)}</td>
                      <td className="px-4 py-3 text-right">{formatMoeda(row.valorTotalConsumido)}</td>
                      <td className="px-4 py-3 text-right">{formatPercentual(row.pctIndividual)}</td>
                      <td className="px-4 py-3 text-right">{formatPercentual(row.pctAcumulado)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={CLASSE_BADGE[row.classeAbc] ?? ''}>
                          {row.classeAbc}
                        </span>
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
