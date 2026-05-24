import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { setorFormSchema, type SetorFormData } from './schema'
import { useCadastrarSetor, useEditarSetor, useSetor } from './hooks'
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

export default function SetorFormPage() {
  const params = useParams()
  const id = params.id ? Number(params.id) : undefined
  const isEditMode = Boolean(id)

  const form = useForm<SetorFormData>({
    resolver: zodResolver(setorFormSchema),
    defaultValues: {
      nome: '',
      descricao: '',
    },
  })

  const setorQuery = useSetor(id)
  const cadastrarMutation = useCadastrarSetor()
  const editarMutation = useEditarSetor(id ?? 0)

  useEffect(() => {
    if (!isEditMode || !setorQuery.data) return

    form.reset({
      nome: setorQuery.data.nome,
      descricao: toFormValue(setorQuery.data.descricao),
    })
  }, [form, setorQuery.data, isEditMode])

  async function onSubmit(values: SetorFormData) {
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
            {isEditMode ? 'Editar setor' : 'Novo setor'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? 'Atualize os dados do setor.'
              : 'Preencha os dados para cadastrar um novo setor.'}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link to="/setores">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do setor</CardTitle>
          <CardDescription>
            Os campos obrigatórios devem ser preenchidos antes de salvar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditMode && setorQuery.isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Carregando setor...
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
                          <Input
                            placeholder="Ex.: Almoxarifado"
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
                            placeholder="Breve descrição do setor (opcional)"
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
                    <Link to="/setores">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? 'Salvando...'
                      : isEditMode
                        ? 'Salvar alterações'
                        : 'Cadastrar setor'}
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
