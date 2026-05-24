import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { gruposApi } from '@/api/grupos'
import type { GrupoCreateRequest, GrupoListParams, GrupoUpdateRequest } from '@/types/api'

function getErrorMessage(error: unknown) {
  const err = error as { response?: { data?: { erro?: string } } }
  return err.response?.data?.erro ?? 'Ocorreu um erro na operação.'
}

export function useGrupos(params: GrupoListParams) {
  return useQuery({
    queryKey: ['grupos', params],
    queryFn: () => gruposApi.listar(params),
  })
}

export function useGrupo(id?: number) {
  return useQuery({
    queryKey: ['grupos', 'detalhe', id],
    queryFn: () => gruposApi.buscarPorId(id as number),
    enabled: Boolean(id),
  })
}

export function useCadastrarGrupo() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: GrupoCreateRequest) => gruposApi.cadastrar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] })
      toast.success('Grupo cadastrado com sucesso.')
      navigate('/grupos')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useEditarGrupo(id: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: GrupoUpdateRequest) => gruposApi.editar(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['grupos'] })
      await queryClient.invalidateQueries({ queryKey: ['grupos', 'detalhe', id] })
      toast.success('Grupo atualizado com sucesso.')
      navigate('/grupos')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
