import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProdutosEmFalta } from '@/features/relatorios/hooks'
import { useEntradas } from '@/features/entradas/hooks'
import { useSaidas } from '@/features/saidas/hooks'
import { useAuthStore } from '@/stores/authStore'
import { formatData, formatMoeda } from '@/lib/format'

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <tr key={i} className="border-b last:border-b-0">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 rounded bg-muted animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default function DashboardPage() {
  const usuario = useAuthStore((s) => s.usuario)

  const { data: emFaltaData, isLoading: emFaltaLoading } = useProdutosEmFalta({}, true)

  const { data: entradasData, isLoading: entradasLoading } = useEntradas({
    pagina: 1,
    tamanhoPagina: 5,
  })

  const { data: saidasData, isLoading: saidasLoading } = useSaidas({
    pagina: 1,
    tamanhoPagina: 5,
  })

  const emFalta = emFaltaData ?? []
  const entradas = entradasData?.itens ?? []
  const saidas = saidasData?.itens ?? []

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Painel</h1>
        <p className="text-sm text-muted-foreground">
          Bem-vindo, {usuario?.nomeCompleto}. Perfil: {usuario?.perfilNome}.
        </p>
      </div>

      {/* Produtos em Falta */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <CardTitle>
            Produtos em Falta
            {!emFaltaLoading && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({emFalta.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emFaltaLoading ? (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Produto</th>
                    <th className="px-4 py-3 text-left font-medium">Grupo</th>
                    <th className="px-4 py-3 text-right font-medium">Saldo</th>
                    <th className="px-4 py-3 text-right font-medium">Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  <SkeletonRows cols={4} />
                </tbody>
              </table>
            </div>
          ) : emFalta.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum produto abaixo do estoque mínimo.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Produto</th>
                    <th className="px-4 py-3 text-left font-medium">Grupo</th>
                    <th className="px-4 py-3 text-right font-medium">Saldo</th>
                    <th className="px-4 py-3 text-right font-medium">Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {emFalta.map((p) => (
                    <tr key={p.idProduto} className="border-b last:border-b-0">
                      <td className="px-4 py-3">{p.produto}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.grupo}</td>
                      <td className="px-4 py-3 text-right font-medium text-red-600 dark:text-red-400">
                        {p.saldoAtual} {p.unidadeMedida}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {p.estoqueMinimo} {p.unidadeMedida}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Entradas Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <ArrowDownToLine className="h-5 w-5 text-green-500" />
            <CardTitle>Entradas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {entradasLoading ? (
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">Data</th>
                      <th className="px-4 py-3 text-left font-medium">Fornecedor</th>
                      <th className="px-4 py-3 text-left font-medium">NF</th>
                    </tr>
                  </thead>
                  <tbody>
                    <SkeletonRows cols={3} />
                  </tbody>
                </table>
              </div>
            ) : entradas.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma entrada registrada.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">Data</th>
                      <th className="px-4 py-3 text-left font-medium">Fornecedor</th>
                      <th className="px-4 py-3 text-right font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entradas.map((e) => (
                      <tr key={e.idEntrada} className="border-b last:border-b-0">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatData(e.dataEntrada)}
                        </td>
                        <td className="px-4 py-3">{e.fornecedor}</td>
                        <td className="px-4 py-3 text-right">
                          {e.valorTotal != null ? formatMoeda(e.valorTotal) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saídas Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <ArrowUpFromLine className="h-5 w-5 text-blue-500" />
            <CardTitle>Saídas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {saidasLoading ? (
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">Data</th>
                      <th className="px-4 py-3 text-left font-medium">Setor</th>
                      <th className="px-4 py-3 text-right font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <SkeletonRows cols={3} />
                  </tbody>
                </table>
              </div>
            ) : saidas.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma saída registrada.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">Data</th>
                      <th className="px-4 py-3 text-left font-medium">Setor</th>
                      <th className="px-4 py-3 text-right font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saidas.map((s) => (
                      <tr key={s.idSaida} className="border-b last:border-b-0">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatData(s.dataSaida)}
                        </td>
                        <td className="px-4 py-3">{s.setor}</td>
                        <td className="px-4 py-3 text-right">
                          {s.valorTotal != null ? formatMoeda(s.valorTotal) : '—'}
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
    </div>
  )
}
