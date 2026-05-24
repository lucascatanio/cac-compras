import { useState } from 'react'
import { FileText } from 'lucide-react'
import { useFichaProduto } from './hooks'
import { useProdutos } from '@/features/produtos/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatData, formatMoeda, formatNumero } from '@/lib/format'
import type { FichaProdutoParams } from '@/types/api'

interface FiltroAplicado extends FichaProdutoParams {
  idProduto: number
}

export default function FichaProdutoPage() {
  const [idProduto, setIdProduto] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [filtro, setFiltro] = useState<FiltroAplicado | null>(null)

  const { data: produtosData } = useProdutos({ ativo: true, pagina: 1, tamanhoPagina: 500 })
  const produtos = produtosData?.itens ?? []

  const { data, isLoading, isError } = useFichaProduto(
    filtro?.idProduto,
    filtro ? { dataInicio: filtro.dataInicio, dataFim: filtro.dataFim } : {},
    filtro !== null
  )

  function handleGerar(e: React.FormEvent) {
    e.preventDefault()
    if (!idProduto) return
    setFiltro({
      idProduto: Number(idProduto),
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
    })
  }

  function handleLimpar() {
    setIdProduto('')
    setDataInicio('')
    setDataFim('')
    setFiltro(null)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Ficha do Produto</h1>
        <p className="text-sm text-muted-foreground">
          Histórico completo de entradas e saídas de um produto.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGerar} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
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

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          {filtro === null ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Selecione um produto e clique em Gerar para visualizar a ficha.
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
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Nenhum movimento encontrado.</p>
              <p className="text-sm text-muted-foreground">
                Não há movimentações registradas para os filtros informados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Data</th>
                    <th className="px-4 py-3 text-left font-medium">Tipo</th>
                    <th className="px-4 py-3 text-left font-medium">Fornecedor / Setor</th>
                    <th className="px-4 py-3 text-left font-medium">Referência</th>
                    <th className="px-4 py-3 text-right font-medium">Quantidade</th>
                    <th className="px-4 py-3 text-right font-medium">Preço Unit.</th>
                    <th className="px-4 py-3 text-right font-medium">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-4 py-3 whitespace-nowrap">{formatData(row.dataMovimento)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            row.tipoMovimento === 'ENTRADA'
                              ? 'text-green-600 font-medium'
                              : 'text-red-600 font-medium'
                          }
                        >
                          {row.tipoMovimento === 'ENTRADA' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{row.fornecedorOuSetor}</td>
                      <td className="px-4 py-3">{row.referencia ?? '—'}</td>
                      <td className="px-4 py-3 text-right">{formatNumero(row.quantidade)}</td>
                      <td className="px-4 py-3 text-right">{formatMoeda(row.precoUnitario)}</td>
                      <td className="px-4 py-3 text-right">{formatMoeda(row.valorTotal)}</td>
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
