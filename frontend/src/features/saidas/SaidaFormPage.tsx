import { Link } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { saidaFormSchema, type SaidaFormData } from './schema'
import { useRegistrarSaida } from './hooks'
import { useSetores } from '@/features/setores/hooks'
import { useProdutos } from '@/features/produtos/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

const TEXTAREA_CLASS =
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

export default function SaidaFormPage() {
  const { data: setoresData, isLoading: setoresLoading } = useSetores({ ativo: true })
  const { data: produtosData, isLoading: produtosLoading } = useProdutos({
    ativo: true,
    pagina: 1,
    tamanhoPagina: 500,
  })

  const setores = setoresData ?? []
  const produtos = produtosData?.itens ?? []

  const form = useForm<SaidaFormData>({
    resolver: zodResolver(saidaFormSchema),
    defaultValues: {
      idSetor: '0',
      observacao: '',
      itens: [{ idProduto: '0', quantidade: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'itens',
  })

  const registrarMutation = useRegistrarSaida()

  async function onSubmit(values: SaidaFormData) {
    await registrarMutation.mutateAsync({
      idSetor: parseInt(values.idSetor, 10),
      observacao: values.observacao?.trim() || null,
      itens: values.itens.map((item) => ({
        idProduto: parseInt(item.idProduto, 10),
        quantidade: parseFloat(item.quantidade),
      })),
    })
  }

  const isPageLoading = setoresLoading || produtosLoading

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Nova saída</h1>
          <p className="text-sm text-muted-foreground">
            Preencha o cabeçalho e os itens para registrar a saída de estoque.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link to="/saidas">Voltar</Link>
        </Button>
      </div>

      {isPageLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Carregando...</div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cabeçalho</CardTitle>
                <CardDescription>Identifique o setor solicitante desta saída.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="idSetor"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Setor</FormLabel>
                        <FormControl>
                          <select
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            onBlur={field.onBlur}
                            className={SELECT_CLASS}
                          >
                            <option value="0">Selecione um setor</option>
                            {setores.map((s) => (
                              <option key={s.idSetor} value={String(s.idSetor)}>
                                {s.nome}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="observacao"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Observação</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Observações sobre a saída (opcional)"
                            className={TEXTAREA_CLASS}
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>Itens</CardTitle>
                  <CardDescription className="mt-1">
                    Adicione os produtos retirados do estoque. O preço médio é registrado automaticamente.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ idProduto: '0', quantidade: '' })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Nenhum item adicionado. Clique em "Adicionar item" para começar.
                  </p>
                )}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_140px_auto]"
                  >
                    <FormField
                      control={form.control}
                      name={`itens.${index}.idProduto`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Produto</FormLabel>
                          <FormControl>
                            <select
                              value={f.value}
                              onChange={(e) => f.onChange(e.target.value)}
                              onBlur={f.onBlur}
                              className={SELECT_CLASS}
                            >
                              <option value="0">Selecione</option>
                              {produtos.map((p) => (
                                <option key={p.idProduto} value={String(p.idProduto)}>
                                  {p.nome} ({p.unidadeMedida}) — saldo: {p.saldo}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`itens.${index}.quantidade`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.001"
                              min="0.001"
                              placeholder="0,000"
                              {...f}
                              value={f.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {form.formState.errors.itens?.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.itens.root.message}
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button asChild type="button" variant="outline">
                <Link to="/saidas">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={registrarMutation.isPending}>
                {registrarMutation.isPending ? 'Registrando...' : 'Registrar saída'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
