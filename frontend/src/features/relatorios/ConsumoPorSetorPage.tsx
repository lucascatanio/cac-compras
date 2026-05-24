import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { useConsumoPorSetor } from './hooks'
import { useSetores } from '@/features/setores/hooks'
import { useGrupos } from '@/features/grupos/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatMoeda, formatNumero } from '@/lib/format'
import type { ConsumoPorSetorParams } from '@/types/api'

export default function ConsumoPorSetorPage() {
  const [idSetor, setIdSetor] = useState('')
  const [idGrupo, setIdGrupo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [filtro, setFiltro] = useState<ConsumoPorSetorParams | null>(null)

  const { data: setores = [] } = useSetores({ ativo: true })
  const { data: grupos = [] } = useGrupos({})

  const { data, isLoading, isError } = useConsumoPorSetor(filtro ?? {}, filtro !== null)

  function handleGerar(e: React.FormEvent) {
    e.preventDefault()
    setFiltro({
      idSetor: idSetor ? Number(idSetor) : undefined,
      idGrupo: idGrupo ? Number(idGrupo) : undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
    })
  }

  function handleLimpar() {
    setIdSetor('')
    setIdGrupo('')
    setDataInicio('')
    setDataFim('')
    setFiltro(null)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Consumo por Setor</h1>
        <p className="text-sm text-muted-foreground">
          Visualize o consumo de produtos agrupado por setor no período selecionado.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGerar} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
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
                Não há consumo registrado para os filtros informados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Setor</th>
                    <th className="px-4 py-3 text-left font-medium">Produto</th>
                    <th className="px-4 py-3 text-left font-medium">Grupo</th>
                    <th className="px-4 py-3 text-right font-medium">Qtd. Consumida</th>
                    <th className="px-4 py-3 text-right font-medium">Valor Consumido</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-4 py-3">{row.setor}</td>
                      <td className="px-4 py-3">{row.produto}</td>
                      <td className="px-4 py-3">{row.grupo}</td>
                      <td className="px-4 py-3 text-right">{formatNumero(row.qtdConsumida)}</td>
                      <td className="px-4 py-3 text-right">{formatMoeda(row.valorConsumido)}</td>
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
