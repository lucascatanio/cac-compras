import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  usuarioCriarSchema,
  usuarioEditarSchema,
  usuarioAlterarSenhaSchema,
  type UsuarioCriarFormData,
  type UsuarioEditarFormData,
  type UsuarioAlterarSenhaFormData,
} from './schema'
import {
  useAlterarSenhaUsuario,
  useCadastrarUsuario,
  useEditarUsuario,
  usePerfis,
  useUsuario,
} from './hooks'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

export default function UsuarioFormPage() {
  const params = useParams()
  const id = params.id ? Number(params.id) : undefined
  const isEditMode = Boolean(id)

  const { data: perfis } = usePerfis()
  const usuarioQuery = useUsuario(id)
  const cadastrarMutation = useCadastrarUsuario()
  const editarMutation = useEditarUsuario(id ?? 0)
  const alterarSenhaMutation = useAlterarSenhaUsuario(id ?? 0)

  const criarForm = useForm<UsuarioCriarFormData>({
    resolver: zodResolver(usuarioCriarSchema),
    defaultValues: {
      username: '',
      senha: '',
      nomeCompleto: '',
      email: '',
      codigoPerfil: '',
    },
  })

  const editarForm = useForm<UsuarioEditarFormData>({
    resolver: zodResolver(usuarioEditarSchema),
    defaultValues: {
      nomeCompleto: '',
      email: '',
      codigoPerfil: '',
    },
  })

  const senhaForm = useForm<UsuarioAlterarSenhaFormData>({
    resolver: zodResolver(usuarioAlterarSenhaSchema),
    defaultValues: {
      novaSenha: '',
      confirmarSenha: '',
    },
  })

  const [senhaAlterada, setSenhaAlterada] = useState(false)

  useEffect(() => {
    if (!isEditMode || !usuarioQuery.data) return
    const u = usuarioQuery.data
    editarForm.reset({
      nomeCompleto: u.nomeCompleto,
      email: toFormValue(u.email),
      codigoPerfil: u.perfilCodigo,
    })
  }, [editarForm, usuarioQuery.data, isEditMode])

  async function onSubmitCriar(values: UsuarioCriarFormData) {
    await cadastrarMutation.mutateAsync({
      username: values.username.trim(),
      senha: values.senha,
      nomeCompleto: values.nomeCompleto.trim(),
      email: values.email?.trim() || null,
      codigoPerfil: values.codigoPerfil,
    })
  }

  async function onSubmitEditar(values: UsuarioEditarFormData) {
    await editarMutation.mutateAsync({
      nomeCompleto: values.nomeCompleto.trim(),
      email: values.email?.trim() || null,
      codigoPerfil: values.codigoPerfil,
    })
  }

  async function onSubmitSenha(values: UsuarioAlterarSenhaFormData) {
    await alterarSenhaMutation.mutateAsync({ novaSenha: values.novaSenha })
    senhaForm.reset()
    setSenhaAlterada(true)
  }

  const isSubmitting = cadastrarMutation.isPending || editarMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            {isEditMode ? 'Editar usuário' : 'Novo usuário'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? 'Atualize os dados do usuário.'
              : 'Preencha os dados para cadastrar um novo usuário.'}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/usuarios">Voltar</Link>
        </Button>
      </div>

      {isEditMode && usuarioQuery.isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Carregando usuário...
        </div>
      ) : isEditMode ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Dados do usuário</CardTitle>
              <CardDescription>
                Username não pode ser alterado após o cadastro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...editarForm}>
                <form
                  onSubmit={editarForm.handleSubmit(onSubmitEditar)}
                  className="space-y-6"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Username
                      </label>
                      <p className="text-sm font-medium">
                        {usuarioQuery.data?.username}
                      </p>
                    </div>

                    <FormField
                      control={editarForm.control}
                      name="nomeCompleto"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome completo do usuário"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editarForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="email@exemplo.com (opcional)"
                              {...field}
                              value={field.value ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editarForm.control}
                      name="codigoPerfil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Perfil</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Selecione um perfil</option>
                              {perfis?.map((p) => (
                                <option key={p.codigo} value={p.codigo}>
                                  {p.nome}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button asChild type="button" variant="outline">
                      <Link to="/usuarios">Cancelar</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alterar senha</CardTitle>
              <CardDescription>
                A nova senha substitui imediatamente a senha atual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {senhaAlterada && (
                <p className="mb-4 text-sm text-emerald-600 font-medium">
                  Senha alterada com sucesso.
                </p>
              )}
              <Form {...senhaForm}>
                <form
                  onSubmit={senhaForm.handleSubmit(onSubmitSenha)}
                  className="space-y-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={senhaForm.control}
                      name="novaSenha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Mínimo 6 caracteres"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={senhaForm.control}
                      name="confirmarSenha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar nova senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Repita a nova senha"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={alterarSenhaMutation.isPending}
                    >
                      {alterarSenhaMutation.isPending
                        ? 'Alterando...'
                        : 'Alterar senha'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Dados do usuário</CardTitle>
            <CardDescription>
              Os campos obrigatórios devem ser preenchidos antes de salvar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...criarForm}>
              <form
                onSubmit={criarForm.handleSubmit(onSubmitCriar)}
                className="space-y-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={criarForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex.: joao.silva"
                            autoComplete="off"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={criarForm.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            autoComplete="new-password"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={criarForm.control}
                    name="nomeCompleto"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nome completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome completo do usuário"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={criarForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@exemplo.com (opcional)"
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={criarForm.control}
                    name="codigoPerfil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perfil</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">Selecione um perfil</option>
                            {perfis?.map((p) => (
                              <option key={p.codigo} value={p.codigo}>
                                {p.nome}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button asChild type="button" variant="outline">
                    <Link to="/usuarios">Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando...' : 'Cadastrar usuário'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
