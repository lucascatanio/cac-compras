import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  fornecedorCreateSchema,
  fornecedorUpdateSchema,
  type FornecedorCreateFormData,
  type FornecedorUpdateFormData,
} from './schema'
import { useCadastrarFornecedor, useEditarFornecedor, useFornecedor } from './hooks'
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

type FormValues = FornecedorCreateFormData | FornecedorUpdateFormData

const EMPTY_VALUES = {
  razaoSocial: '',
  cnpj: '',
  telefone: null,
  email: null,
  logradouro: null,
  numero: null,
  complemento: null,
  bairro: null,
  cidade: null,
  uf: null,
  cep: null,
}

function toFormValue(value: string | null | undefined) {
  return value ?? ''
}

function emptyToNull(value: string | null | undefined) {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export default function FornecedorFormPage() {
  const params = useParams()
  const id = params.id ? Number(params.id) : undefined
  const isEditMode = Boolean(id)

  const schema = useMemo(
    () => (isEditMode ? fornecedorUpdateSchema : fornecedorCreateSchema),
    [isEditMode]
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEditMode
      ? {
          razaoSocial: '',
          telefone: '',
          email: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          uf: '',
          cep: '',
        }
      : {
          ...EMPTY_VALUES,
          telefone: '',
          email: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          uf: '',
          cep: '',
        },
  })

  const fornecedorQuery = useFornecedor(id)
  const cadastrarMutation = useCadastrarFornecedor()
  const editarMutation = useEditarFornecedor(id ?? 0)

  useEffect(() => {
    if (!isEditMode || !fornecedorQuery.data) return

    form.reset({
      razaoSocial: fornecedorQuery.data.razaoSocial,
      telefone: toFormValue(fornecedorQuery.data.telefone),
      email: toFormValue(fornecedorQuery.data.email),
      logradouro: toFormValue(fornecedorQuery.data.logradouro),
      numero: toFormValue(fornecedorQuery.data.numero),
      complemento: toFormValue(fornecedorQuery.data.complemento),
      bairro: toFormValue(fornecedorQuery.data.bairro),
      cidade: toFormValue(fornecedorQuery.data.cidade),
      uf: toFormValue(fornecedorQuery.data.uf),
      cep: toFormValue(fornecedorQuery.data.cep),
    })
  }, [form, fornecedorQuery.data, isEditMode])

  async function onSubmit(values: FormValues) {
  if (isEditMode && id) {
    await editarMutation.mutateAsync({
      razaoSocial: values.razaoSocial.trim(),
      telefone: emptyToNull(values.telefone),
      email: emptyToNull(values.email),
      logradouro: emptyToNull(values.logradouro),
      numero: emptyToNull(values.numero),
      complemento: emptyToNull(values.complemento),
      bairro: emptyToNull(values.bairro),
      cidade: emptyToNull(values.cidade),
      uf: emptyToNull(values.uf)?.toUpperCase() ?? null,
      cep: emptyToNull(values.cep),
    })
    return
  }

  const createValues = values as FornecedorCreateFormData

  await cadastrarMutation.mutateAsync({
    razaoSocial: createValues.razaoSocial.trim(),
    cnpj: createValues.cnpj.trim(),
    telefone: emptyToNull(createValues.telefone),
    email: emptyToNull(createValues.email),
    logradouro: emptyToNull(createValues.logradouro),
    numero: emptyToNull(createValues.numero),
    complemento: emptyToNull(createValues.complemento),
    bairro: emptyToNull(createValues.bairro),
    cidade: emptyToNull(createValues.cidade),
    uf: emptyToNull(createValues.uf)?.toUpperCase() ?? null,
    cep: emptyToNull(createValues.cep),
  })
}

  const isSubmitting = cadastrarMutation.isPending || editarMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            {isEditMode ? 'Editar fornecedor' : 'Novo fornecedor'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? 'Atualize os dados cadastrais do fornecedor.'
              : 'Preencha os dados para cadastrar um novo fornecedor.'}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link to="/fornecedores">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do fornecedor</CardTitle>
          <CardDescription>
            Os campos obrigatórios devem ser preenchidos antes de salvar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditMode && fornecedorQuery.isLoading ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Carregando fornecedor...
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="razaoSocial"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Razão social</FormLabel>
                        <FormControl>
                          <Input placeholder="Fornecedor Exemplo Ltda" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isEditMode && (
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl>
                            <Input placeholder="Somente números" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="11999999999" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="contato@fornecedor.com.br" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <h2 className="text-base font-semibold">Endereço</h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="logradouro"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Logradouro</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, avenida, etc." {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="complemento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input placeholder="Sala, bloco, andar" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Centro" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="São Paulo" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="uf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UF</FormLabel>
                          <FormControl>
                            <Input placeholder="SP" maxLength={2} {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="Somente números" {...field} value={field.value ?? ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button asChild type="button" variant="outline">
                    <Link to="/fornecedores">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? 'Salvando...'
                      : isEditMode
                        ? 'Salvar alterações'
                        : 'Cadastrar fornecedor'}
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