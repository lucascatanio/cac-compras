import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { perfisApi } from '@/api/perfis'
import { usuariosApi } from '@/api/usuarios'
import type {
  DefinirAtivoRequest,
  UsuarioChangePasswordRequest,
  UsuarioCreateRequest,
  UsuarioListParams,
  UsuarioUpdateRequest,
} from '@/types/api'

function getErrorMessage(error: unknown) {
  const err = error as { response?: { data?: { erro?: string } } }
  return err.response?.data?.erro ?? 'Ocorreu um erro na operação.'
}

export function usePerfis() {
  return useQuery({
    queryKey: ['perfis'],
    queryFn: () => perfisApi.listar(),
  })
}

export function useUsuarios(params: UsuarioListParams) {
  return useQuery({
    queryKey: ['usuarios', params],
    queryFn: () => usuariosApi.listar(params),
  })
}

export function useUsuario(id?: number) {
  return useQuery({
    queryKey: ['usuarios', 'detalhe', id],
    queryFn: () => usuariosApi.buscarPorId(id as number),
    enabled: Boolean(id),
  })
}

export function useCadastrarUsuario() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: UsuarioCreateRequest) => usuariosApi.cadastrar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Usuário cadastrado com sucesso.')
      navigate('/usuarios')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useEditarUsuario(id: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: UsuarioUpdateRequest) => usuariosApi.editar(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      await queryClient.invalidateQueries({ queryKey: ['usuarios', 'detalhe', id] })
      toast.success('Usuário atualizado com sucesso.')
      navigate('/usuarios')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useAlterarSenhaUsuario(id: number) {
  return useMutation({
    mutationFn: (payload: UsuarioChangePasswordRequest) =>
      usuariosApi.alterarSenha(id, payload),
    onSuccess: () => {
      toast.success('Senha alterada com sucesso.')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDefinirAtivoUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DefinirAtivoRequest }) =>
      usuariosApi.definirAtivo(id, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      await queryClient.invalidateQueries({
        queryKey: ['usuarios', 'detalhe', variables.id],
      })
      toast.success(
        variables.payload.ativo
          ? 'Usuário ativado com sucesso.'
          : 'Usuário inativado com sucesso.'
      )
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
