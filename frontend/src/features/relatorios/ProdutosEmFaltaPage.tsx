import { useState } from 'react'
import { Package } from 'lucide-react'
import { useProdutosEmFalta } from './hooks'
import { useGrupos } from '@/features/grupos/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoeda, formatNumero } from '@/lib/format'
import type { ProdutosEmFaltaParams } from '@/types/api'

export default function ProdutosEmFaltaPage() {
  const [idGrupo, setIdGrupo] = useState('')
  const [filtro, setFiltro] = useState<ProdutosEmFaltaParams | null>(null)

  const { data: grupos = [] } = useGrupos({})

  const { data, isLoading, isError } = useProdutosEmFalta(filtro ?? {}, filtro !== null)

  function handleGerar(e: React.FormEvent) {
    e.preventDefault()
    setFiltro({
      idGrupo: idGrupo ? Number(idGrupo) : undefined,
    })
  }

  function handleLimpar() {
    setIdGrupo('')
    setFiltro(null)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Produtos em Falta</h1>
        <p className="text-sm text-muted-foreground">
          Produtos com saldo abaixo do estoque mínimo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGerar} className="grid gap-4 md:grid-cols-[1fr_auto]">
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
                <option value="">Todos os grupos</option>
                {grupos.map((g) => (
                  <option key={g.idGrupo} value={String(g.idGrupo)}>
                    {g.nome}
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
              <Package className="h-10 w-10 text-muted-foreground" />
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
              <Package className="h-10 w-10 text-muted-foreground" />
              <p className="font-medium">Nenhum produto em falta.</p>
              <p className="text-sm text-muted-foreground">
                Todos os produtos estão acima do estoque mínimo.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Produto</th>
                    <th className="px-4 py-3 text-left font-medium">Grupo</th>
                    <th className="px-4 py-3 text-left font-medium">Un.</th>
                    <th className="px-4 py-3 text-right font-medium">Saldo Atual</th>
                    <th className="px-4 py-3 text-right font-medium">Est. Mínimo</th>
                    <th className="px-4 py-3 text-right font-medium">Qtd. em Falta</th>
                    <th className="px-4 py-3 text-right font-medium">Preço Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.idProduto} className="border-b last:border-b-0">
                      <td className="px-4 py-3">{row.produto}</td>
                      <td className="px-4 py-3">{row.grupo}</td>
                      <td className="px-4 py-3">{row.unidadeMedida}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">
                        {formatNumero(row.saldoAtual)}
                      </td>
                      <td className="px-4 py-3 text-right">{formatNumero(row.estoqueMinimo)}</td>
                      <td className="px-4 py-3 text-right text-red-600 font-medium">
                        {formatNumero(row.qtdEmFalta)}
                      </td>
                      <td className="px-4 py-3 text-right">{formatMoeda(row.precoMedio)}</td>
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
