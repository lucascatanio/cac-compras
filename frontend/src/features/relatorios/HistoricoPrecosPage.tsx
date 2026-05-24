import { useState } from 'react'
import { LineChart } from 'lucide-react'
import { useHistoricoPrecos } from './hooks'
import { useProdutos } from '@/features/produtos/hooks'
import { useFornecedores } from '@/features/fornecedores/hooks'
import HistoricoPrecoChart from '@/components/charts/HistoricoPrecoChart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatData, formatMoeda, formatNumero } from '@/lib/format'
import type { HistoricoPrecosParams } from '@/types/api'

interface FiltroAplicado extends HistoricoPrecosParams {
  idProduto: number
}

export default function HistoricoPrecosPage() {
  const [idProduto, setIdProduto] = useState('')
  const [idFornecedor, setIdFornecedor] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [filtro, setFiltro] = useState<FiltroAplicado | null>(null)

  const { data: produtosData } = useProdutos({ ativo: true, pagina: 1, tamanhoPagina: 500 })
  const produtos = produtosData?.itens ?? []

  const { data: fornecedoresData } = useFornecedores({ ativo: true, pagina: 1, tamanhoPagina: 500 })
  const fornecedores = fornecedoresData?.itens ?? []

  const { data, isLoading, isError } = useHistoricoPrecos(
    filtro?.idProduto,
    filtro
      ? {
          idFornecedor: filtro.idFornecedor,
          dataInicio: filtro.dataInicio,
          dataFim: filtro.dataFim,
        }
      : {},
    filtro !== null
  )

  function handleGerar(e: React.FormEvent) {
    e.preventDefault()
    if (!idProduto) return
    setFiltro({
      idProduto: Number(idProduto),
      idFornecedor: idFornecedor ? Number(idFornecedor) : undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
    })
  }

  function handleLimpar() {
    setIdProduto('')
    setIdFornecedor('')
    setDataInicio('')
    setDataFim('')
    setFiltro(null)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Histórico de Preços</h1>
        <p className="text-sm text-muted-foreground">
          Evolução do preço de compra de um produto ao longo do tempo, por fornecedor.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGerar} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <div className="space-y-2">
              <label htmlFor="produto" className="text-sm font-medium">
                Produto <span className="text-destructive">*</span>
              </label>
              <select
                id="produto"
                value={idProduto}
                onChange={(e) => setIdProduto(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione um produto</option>
                {produtos.map((p) => (
                  <option key={p.idProduto} value={String(p.idProduto)}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="fornecedor" className="text-sm font-medium">
                Fornecedor
              </label>
              <select
                id="fornecedor"
                value={idFornecedor}
                onChange={(e) => setIdFornecedor(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {fornecedores.map((f) => (
                  <option key={f.idFornecedor} value={String(f.idFornecedor)}>
                    {f.razaoSocial}
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
              <Button type="submit" disabled={!idProduto}>
                Gerar
              </Button>
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
            <CardTitle>Evolução de Preços</CardTitle>
          </CardHeader>
          <CardContent>
            <HistoricoPrecoChart data={data} />
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
              <LineChart className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Selecione um produto e clique em Gerar para visualizar o histórico.
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
              <LineChart className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Nenhum registro encontrado.</p>
              <p className="text-sm text-muted-foreground">
                Não há histórico de compras para os filtros informados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Data</th>
                    <th className="px-4 py-3 text-left font-medium">Fornecedor</th>
                    <th className="px-4 py-3 text-right font-medium">Preço Unitário</th>
                    <th className="px-4 py-3 text-right font-medium">Quantidade</th>
                    <th className="px-4 py-3 text-right font-medium">Média Móvel (3)</th>
                    <th className="px-4 py-3 text-right font-medium">Compra Anterior</th>
                    <th className="px-4 py-3 text-right font-medium">Δ vs Anterior</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-4 py-3 whitespace-nowrap">{formatData(row.dataEntrada)}</td>
                      <td className="px-4 py-3">{row.fornecedor}</td>
                      <td className="px-4 py-3 text-right">{formatMoeda(row.precoUnitario)}</td>
                      <td className="px-4 py-3 text-right">{formatNumero(row.quantidade)}</td>
                      <td className="px-4 py-3 text-right">
                        {row.mediaMovel3Compras !== null ? formatMoeda(row.mediaMovel3Compras) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.precoCompraAnterior !== null ? formatMoeda(row.precoCompraAnterior) : '—'}
                      </td>
                      <td
                        className={`px-4 py-3 text-right ${
                          row.deltaVsAnterior !== null && row.deltaVsAnterior > 0
                            ? 'text-red-600'
                            : row.deltaVsAnterior !== null && row.deltaVsAnterior < 0
                            ? 'text-green-600'
                            : ''
                        }`}
                      >
                        {row.deltaVsAnterior !== null
                          ? `${row.deltaVsAnterior > 0 ? '+' : ''}${formatMoeda(row.deltaVsAnterior)}`
                          : '—'}
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
