import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers, Pencil, Plus, Search } from 'lucide-react'
import { useGrupos } from './hooks'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const ROLES_ESCRITA = ['ALMOXARIFE', 'GERENTE_COMPRAS', 'TI'] as const

export default function GruposListPage() {
  const perfilCodigo = useAuthStore((s) => s.usuario?.perfilCodigo ?? '')
  const podeEscrever = ROLES_ESCRITA.includes(perfilCodigo as (typeof ROLES_ESCRITA)[number])

  const [buscaInput, setBuscaInput] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')

  const { data, isLoading, isFetching } = useGrupos({
    busca: buscaAplicada || undefined,
  })

  function handleBuscar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBuscaAplicada(buscaInput.trim())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Grupos</h1>
          <p className="text-sm text-muted-foreground">
            Consulte, cadastre e edite grupos de produtos.
          </p>
        </div>

        {podeEscrever && (
          <Button asChild>
            <Link to="/grupos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo grupo
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBuscar} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome"
                value={buscaInput}
                onChange={(e) => setBuscaInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit">Buscar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Lista de grupos</CardTitle>
          {isFetching && !isLoading && (
            <span className="text-sm text-muted-foreground">Atualizando...</span>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Carregando grupos...
            </div>
          ) : !data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Layers className="h-10 w-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">Nenhum grupo encontrado.</p>
                <p className="text-sm text-muted-foreground">
                  Ajuste os filtros ou cadastre um novo grupo.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Nome</th>
                    <th className="px-4 py-3 text-left font-medium">Descrição</th>
                    <th className="px-4 py-3 text-right font-medium">Produtos ativos</th>
                    {podeEscrever && (
                      <th className="px-4 py-3 text-right font-medium">Ações</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.map((grupo) => (
                    <tr key={grupo.idGrupo} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium">{grupo.nome}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {grupo.descricao ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right">{grupo.qtdProdutosAtivos}</td>
                      {podeEscrever && (
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/grupos/${grupo.idGrupo}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </Button>
                          </div>
                        </td>
                      )}
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
