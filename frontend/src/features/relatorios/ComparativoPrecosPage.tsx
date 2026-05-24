import { useState } from 'react'
import { Scale } from 'lucide-react'
import { useComparativoPrecos } from './hooks'
import { useProdutos } from '@/features/produtos/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatData, formatMoeda, formatPercentual } from '@/lib/format'
import type { ComparativoPrecosParams } from '@/types/api'

const CLASSIFICACAO_CLASSES: Record<string, string> = {
  'MELHOR PREÇO': 'text-green-600 font-medium',
  'PIOR PREÇO': 'text-red-600 font-medium',
  'INTERMEDIÁRIO': 'text-amber-600',
}

export default function ComparativoPrecosPage() {
  const [idProduto, setIdProduto] = useState('')
  const [minPct, setMinPct] = useState('')
  const [filtro, setFiltro] = useState<ComparativoPrecosParams | null>(null)

  const { data: produtosData } = useProdutos({ ativo: true, pagina: 1, tamanhoPagina: 500 })
  const produtos = produtosData?.itens ?? []

  const { data, isLoading, isError } = useComparativoPrecos(filtro ?? {}, filtro !== null)

  function handleGerar(e: React.FormEvent) {
    e.preventDefault()
    setFiltro({
      idProduto: idProduto ? Number(idProduto) : undefined,
      minPctAcimaDoMenor: minPct ? Number(minPct) : undefined,
    })
  }

  function handleLimpar() {
    setIdProduto('')
    setMinPct('')
    setFiltro(null)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Comparativo de Preços</h1>
        <p className="text-sm text-muted-foreground">
          Último preço praticado por cada fornecedor, comparado ao menor e à média de mercado.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGerar} className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-2">
              <label htmlFor="produto" className="text-sm font-medium">
                Produto
              </label>
              <select
                id="produto"
                value={idProduto}
                onChange={(e) => setIdProduto(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {produtos.map((p) => (
                  <option key={p.idProduto} value={String(p.idProduto)}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="minPct" className="text-sm font-medium">
                % mínimo acima do menor preço
              </label>
              <Input
                id="minPct"
                type="number"
                min={0}
                step={0.01}
                placeholder="Ex: 10"
                value={minPct}
                onChange={(e) => setMinPct(e.target.value)}
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
              <Scale className="h-10 w-10 text-muted-foreground" />
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
              <Scale className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Nenhum registro encontrado.</p>
              <p className="text-sm text-muted-foreground">
                Não há dados de compra para os filtros informados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Produto</th>
                    <th className="px-4 py-3 text-left font-medium">Grupo</th>
                    <th className="px-4 py-3 text-left font-medium">Fornecedor</th>
                    <th className="px-4 py-3 text-right font-medium">Último Preço</th>
                    <th className="px-4 py-3 text-right font-medium">Menor Preço</th>
                    <th className="px-4 py-3 text-right font-medium">Preço Médio</th>
                    <th className="px-4 py-3 text-right font-medium">Δ vs Menor</th>
                    <th className="px-4 py-3 text-right font-medium">% vs Menor</th>
                    <th className="px-4 py-3 text-left font-medium">Última Compra</th>
                    <th className="px-4 py-3 text-left font-medium">Classificação</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium">{row.produto}</td>
                      <td className="px-4 py-3">{row.grupo}</td>
                      <td className="px-4 py-3">{row.fornecedor}</td>
                      <td className="px-4 py-3 text-right">{formatMoeda(row.ultimoPreco)}</td>
                      <td className="px-4 py-3 text-right">{formatMoeda(row.menorPreco)}</td>
                      <td className="px-4 py-3 text-right">{formatMoeda(row.precoMedio)}</td>
                      <td className="px-4 py-3 text-right">{formatMoeda(row.deltaVsMenor)}</td>
                      <td className="px-4 py-3 text-right">
                        {row.pctAcimaDoMenor !== null ? formatPercentual(row.pctAcimaDoMenor) : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatData(row.dataUltimaCompra)}
                      </td>
                      <td className={`px-4 py-3 ${CLASSIFICACAO_CLASSES[row.classificacao] ?? ''}`}>
                        {row.classificacao}
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
