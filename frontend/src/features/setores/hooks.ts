import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { setoresApi } from '@/api/setores'
import type {
  DefinirAtivoRequest,
  SetorCreateRequest,
  SetorListParams,
  SetorUpdateRequest,
} from '@/types/api'

function getErrorMessage(error: unknown) {
  const err = error as { response?: { data?: { erro?: string } } }
  return err.response?.data?.erro ?? 'Ocorreu um erro na operação.'
}

export function useSetores(params: SetorListParams) {
  return useQuery({
    queryKey: ['setores', params],
    queryFn: () => setoresApi.listar(params),
  })
}

export function useSetor(id?: number) {
  return useQuery({
    queryKey: ['setores', 'detalhe', id],
    queryFn: () => setoresApi.buscarPorId(id as number),
    enabled: Boolean(id),
  })
}

export function useCadastrarSetor() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: SetorCreateRequest) => setoresApi.cadastrar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setores'] })
      toast.success('Setor cadastrado com sucesso.')
      navigate('/setores')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useEditarSetor(id: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: SetorUpdateRequest) => setoresApi.editar(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['setores'] })
      await queryClient.invalidateQueries({ queryKey: ['setores', 'detalhe', id] })
      toast.success('Setor atualizado com sucesso.')
      navigate('/setores')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDefinirAtivoSetor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DefinirAtivoRequest }) =>
      setoresApi.definirAtivo(id, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['setores'] })
      await queryClient.invalidateQueries({
        queryKey: ['setores', 'detalhe', variables.id],
      })
      toast.success(
        variables.payload.ativo ? 'Setor ativado com sucesso.' : 'Setor inativado com sucesso.'
      )
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
