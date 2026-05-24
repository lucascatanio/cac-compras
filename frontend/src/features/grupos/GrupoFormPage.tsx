import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { grupoFormSchema, type GrupoFormData } from './schema'
import { useCadastrarGrupo, useEditarGrupo, useGrupo } from './hooks'
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

function toFormValue(value: string | null | undefined) {
  return value ?? ''
}

export default function GrupoFormPage() {
  const params = useParams()
  const id = params.id ? Number(params.id) : undefined
  const isEditMode = Boolean(id)

  const form = useForm<GrupoFormData>({
    resolver: zodResolver(grupoFormSchema),
    defaultValues: {
      nome: '',
      descricao: '',
    },
  })

  const grupoQuery = useGrupo(id)
  const cadastrarMutation = useCadastrarGrupo()
  const editarMutation = useEditarGrupo(id ?? 0)

  useEffect(() => {
    if (!isEditMode || !grupoQuery.data) return

    form.reset({
      nome: grupoQuery.data.nome,
      descricao: toFormValue(grupoQuery.data.descricao),
    })
  }, [form, grupoQuery.data, isEditMode])

  async function onSubmit(values: GrupoFormData) {
    const payload = {
      nome: values.nome.trim(),
      descricao: values.descricao?.trim() || null,
    }

    if (isEditMode && id) {
      await editarMutation.mutateAsync(payload)
    } else {
      await cadastrarMutation.mutateAsync(payload)
    }
  }

  const isSubmitting = cadastrarMutation.isPending || editarMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            {isEditMode ? 'Editar grupo' : 'Novo grupo'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? 'Atualize os dados do grupo.'
              : 'Preencha os dados para cadastrar um novo grupo.'}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link to="/grupos">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do grupo</CardTitle>
          <CardDescription>
            Os campos obrigatórios devem ser preenchidos antes de salvar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditMode && grupoQuery.isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Carregando grupo...
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex.: Ferramentas" {...field} value={field.value ?? ''} />
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
                            placeholder="Breve descrição do grupo (opcional)"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button asChild type="button" variant="outline">
                    <Link to="/grupos">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? 'Salvando...'
                      : isEditMode
                        ? 'Salvar alterações'
                        : 'Cadastrar grupo'}
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
