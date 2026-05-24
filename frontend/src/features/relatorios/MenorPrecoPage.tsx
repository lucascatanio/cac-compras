import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { useMenorPrecoPorProduto } from './hooks'
import { useProdutos } from '@/features/produtos/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatData, formatMoeda } from '@/lib/format'
import type { MenorPrecoPorProdutoParams } from '@/types/api'

export default function MenorPrecoPage() {
  const [idProduto, setIdProduto] = useState('')
  const [filtro, setFiltro] = useState<MenorPrecoPorProdutoParams | null>(null)

  const { data: produtosData } = useProdutos({ ativo: true, pagina: 1, tamanhoPagina: 500 })
  const produtos = produtosData?.itens ?? []

  const { data, isLoading, isError } = useMenorPrecoPorProduto(filtro ?? {}, filtro !== null)

  function handleGerar(e: React.FormEvent) {
    e.preventDefault()
    setFiltro({
      idProduto: idProduto ? Number(idProduto) : undefined,
    })
  }

  function handleLimpar() {
    setIdProduto('')
    setFiltro(null)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Menor Preço por Produto</h1>
        <p className="text-sm text-muted-foreground">
          Fornecedor com o menor preço registrado para cada produto.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGerar} className="grid gap-4 md:grid-cols-[1fr_auto]">
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
                <option value="">Todos os produtos</option>
                {produtos.map((p) => (
                  <option key={p.idProduto} value={String(p.idProduto)}>
                    {p.nome}
                  </option>
                ))}
              </select>
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
              <BarChart3 className="h-10 w-10 text-muted-foreground" />
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
              <BarChart3 className="h-10 w-10 text-muted-foreground" />
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
                    <th className="px-4 py-3 text-left font-medium">Produto</th>
                    <th className="px-4 py-3 text-left font-medium">Grupo</th>
                    <th className="px-4 py-3 text-left font-medium">Fornecedor</th>
                    <th className="px-4 py-3 text-left font-medium">CNPJ</th>
                    <th className="px-4 py-3 text-left font-medium">Telefone</th>
                    <th className="px-4 py-3 text-right font-medium">Menor Preço</th>
                    <th className="px-4 py-3 text-right font-medium">Última Compra</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-4 py-3">{row.produto}</td>
                      <td className="px-4 py-3">{row.grupo}</td>
                      <td className="px-4 py-3">{row.fornecedor}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{row.cnpj}</td>
                      <td className="px-4 py-3">{row.telefone ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-medium text-green-600">
                        {formatMoeda(row.menorPreco)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {formatData(row.dataUltimaCompra)}
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
