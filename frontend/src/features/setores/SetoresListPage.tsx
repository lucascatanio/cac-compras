import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Pencil, Plus, Search } from 'lucide-react'
import { useSetores, useDefinirAtivoSetor } from './hooks'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const ROLES_ESCRITA = ['GERENTE_COMPRAS', 'TI'] as const

function getAtivoParam(value: string): boolean | undefined {
  if (value === 'ativos') return true
  if (value === 'inativos') return false
  return undefined
}

export default function SetoresListPage() {
  const perfilCodigo = useAuthStore((s) => s.usuario?.perfilCodigo ?? '')
  const podeEscrever = ROLES_ESCRITA.includes(perfilCodigo as (typeof ROLES_ESCRITA)[number])

  const [buscaInput, setBuscaInput] = useState('')
  const [buscaAplicada, setBuscaAplicada] = useState('')
  const [ativoFiltro, setAtivoFiltro] = useState<'todos' | 'ativos' | 'inativos'>('todos')

  const { data, isLoading, isFetching } = useSetores({
    busca: buscaAplicada || undefined,
    ativo: getAtivoParam(ativoFiltro),
  })

  const definirAtivoMutation = useDefinirAtivoSetor()

  function handleBuscar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBuscaAplicada(buscaInput.trim())
  }

  async function handleToggleAtivo(id: number, ativoAtual: boolean) {
    await definirAtivoMutation.mutateAsync({ id, payload: { ativo: !ativoAtual } })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Setores</h1>
          <p className="text-sm text-muted-foreground">
            Consulte, cadastre, edite e ative ou inative setores.
          </p>
        </div>

        {podeEscrever && (
          <Button asChild>
            <Link to="/setores/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo setor
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBuscar} className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
            <div className="space-y-2">
              <label htmlFor="busca" className="text-sm font-medium">
                Busca
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="busca"
                  placeholder="Buscar por nome"
                  value={buscaInput}
                  onChange={(e) => setBuscaInput(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="ativo" className="text-sm font-medium">
                Situação
              </label>
              <select
                id="ativo"
                value={ativoFiltro}
                onChange={(e) =>
                  setAtivoFiltro(e.target.value as 'todos' | 'ativos' | 'inativos')
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="todos">Todos</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Buscar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Lista de setores</CardTitle>
          {isFetching && !isLoading && (
            <span className="text-sm text-muted-foreground">Atualizando...</span>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Carregando setores...
            </div>
          ) : !data || data.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Building2 className="h-10 w-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">Nenhum setor encontrado.</p>
                <p className="text-sm text-muted-foreground">
                  Ajuste os filtros ou cadastre um novo setor.
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
                    <th className="px-4 py-3 text-left font-medium">Situação</th>
                    <th className="px-4 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((setor) => (
                    <tr key={setor.idSetor} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium">{setor.nome}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {setor.descricao ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            setor.ativo
                              ? 'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700'
                              : 'inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700'
                          }
                        >
                          {setor.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {podeEscrever && (
                            <>
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/setores/${setor.idSetor}`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </Button>
                              <Button
                                variant={setor.ativo ? 'secondary' : 'default'}
                                size="sm"
                                onClick={() => handleToggleAtivo(setor.idSetor, setor.ativo)}
                                disabled={definirAtivoMutation.isPending}
                              >
                                {setor.ativo ? 'Inativar' : 'Ativar'}
                              </Button>
                            </>
                          )}
                        </div>
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
