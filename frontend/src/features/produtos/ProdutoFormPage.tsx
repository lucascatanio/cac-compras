import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { produtoFormSchema, type ProdutoFormData } from './schema'
import { useCadastrarProduto, useEditarProduto, useProduto } from './hooks'
import { useGrupos } from '@/features/grupos/hooks'
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

export default function ProdutoFormPage() {
  const params = useParams()
  const id = params.id ? Number(params.id) : undefined
  const isEditMode = Boolean(id)

  const form = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoFormSchema),
    defaultValues: {
      idGrupo: '0',
      nome: '',
      descricao: '',
      unidadeMedida: '',
      estoqueMinimo: '0',
    },
  })

  const produtoQuery = useProduto(id)
  const { data: grupos, isLoading: gruposLoading } = useGrupos({})
  const cadastrarMutation = useCadastrarProduto()
  const editarMutation = useEditarProduto(id ?? 0)

  useEffect(() => {
    if (!isEditMode || !produtoQuery.data) return

    form.reset({
      idGrupo: String(produtoQuery.data.idGrupo),
      nome: produtoQuery.data.nome,
      descricao: produtoQuery.data.descricao ?? '',
      unidadeMedida: produtoQuery.data.unidadeMedida,
      estoqueMinimo: String(produtoQuery.data.estoqueMinimo),
    })
  }, [form, produtoQuery.data, isEditMode])

  async function onSubmit(values: ProdutoFormData) {
    const payload = {
      idGrupo: parseInt(values.idGrupo, 10),
      nome: values.nome.trim(),
      descricao:
        typeof values.descricao === 'string' && values.descricao.trim() !== ''
          ? values.descricao.trim()
          : null,
      unidadeMedida: values.unidadeMedida.trim(),
      estoqueMinimo: parseFloat(values.estoqueMinimo),
    }

    if (isEditMode && id) {
      await editarMutation.mutateAsync(payload)
    } else {
      await cadastrarMutation.mutateAsync(payload)
    }
  }

  const isSubmitting = cadastrarMutation.isPending || editarMutation.isPending
  const isPageLoading = (isEditMode && produtoQuery.isLoading) || gruposLoading

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            {isEditMode ? 'Editar produto' : 'Novo produto'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? 'Atualize os dados do produto.'
              : 'Preencha os dados para cadastrar um novo produto.'}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link to="/produtos">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do produto</CardTitle>
          <CardDescription>
            Os campos obrigatórios devem ser preenchidos antes de salvar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPageLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Carregando...
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="idGrupo"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Grupo</FormLabel>
                        <FormControl>
                          <select
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            onBlur={field.onBlur}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="0">Selecione um grupo</option>
                            {grupos?.map((g) => (
                              <option key={g.idGrupo} value={String(g.idGrupo)}>
                                {g.nome}
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
                    name="nome"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex.: Parafuso 6x20mm"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Breve descrição do produto (opcional)"
                            {...field}
                            value={
                              field.value === null || field.value === undefined
                                ? ''
                                : String(field.value)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unidadeMedida"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade de medida</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex.: UN, KG, CX, L"
                            maxLength={20}
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estoqueMinimo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estoque mínimo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0"
                            {...field}
                            value={field.value ?? '0'}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button asChild type="button" variant="outline">
                    <Link to="/produtos">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? 'Salvando...'
                      : isEditMode
                        ? 'Salvar alterações'
                        : 'Cadastrar produto'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
