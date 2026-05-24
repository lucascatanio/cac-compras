import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useEntrada } from './hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDataHora, formatMoeda, formatNumero } from '@/lib/format'

export default function EntradaDetailPage() {
  const params = useParams()
  const id = params.id ? Number(params.id) : undefined

  const { data: entrada, isLoading } = useEntrada(id)

  if (isLoading) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Carregando entrada...
      </div>
    )
  }

  if (!entrada) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Entrada não encontrada.
      </div>
    )
  }

  const valorTotal = entrada.itens.reduce(
    (acc, item) => acc + item.valorTotal,
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Entrada #{entrada.idEntrada}</h1>
          <p className="text-sm text-muted-foreground">
            Detalhes da entrada de estoque.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link to="/entradas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cabeçalho</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Data da entrada</dt>
              <dd className="mt-1 text-sm">{formatDataHora(entrada.dataEntrada)}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">Fornecedor</dt>
              <dd className="mt-1 text-sm">{entrada.fornecedor}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">CNPJ</dt>
              <dd className="mt-1 text-sm">{entrada.cnpj}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">Nota fiscal</dt>
              <dd className="mt-1 text-sm">{entrada.numeroNotaFiscal ?? '—'}</dd>
            </div>

            {entrada.observacao && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Observação</dt>
                <dd className="mt-1 text-sm">{entrada.observacao}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Produto</th>
                  <th className="px-4 py-3 text-left font-medium">Unidade</th>
                  <th className="px-4 py-3 text-right font-medium">Quantidade</th>
                  <th className="px-4 py-3 text-right font-medium">Preço unitário</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {entrada.itens.map((item) => (
                  <tr key={item.idItemEntrada} className="border-b last:border-b-0">
                    <td className="px-4 py-3">{item.produto}</td>
                    <td className="px-4 py-3">{item.unidadeMedida}</td>
                    <td className="px-4 py-3 text-right">{formatNumero(item.quantidade)}</td>
                    <td className="px-4 py-3 text-right">{formatMoeda(item.precoUnitario)}</td>
                    <td className="px-4 py-3 text-right">{formatMoeda(item.valorTotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t bg-muted/50">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right font-semibold">
                    Total da entrada
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatMoeda(valorTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
