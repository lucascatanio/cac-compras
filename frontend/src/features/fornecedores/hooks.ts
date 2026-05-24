import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { fornecedoresApi } from '@/api/fornecedores'
import type {
  DefinirAtivoRequest,
  FornecedorCreateRequest,
  FornecedorListParams,
  FornecedorUpdateRequest,
} from '@/types/api'

function getErrorMessage(error: unknown) {
  const err = error as { response?: { data?: { erro?: string } } }
  return err.response?.data?.erro ?? 'Ocorreu um erro na operação.'
}

export function useFornecedores(params: FornecedorListParams) {
  return useQuery({
    queryKey: ['fornecedores', params],
    queryFn: () => fornecedoresApi.listar(params),
  })
}

export function useFornecedor(id?: number) {
  return useQuery({
    queryKey: ['fornecedores', 'detalhe', id],
    queryFn: () => fornecedoresApi.buscarPorId(id as number),
    enabled: Boolean(id),
  })
}

export function useCadastrarFornecedor() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: FornecedorCreateRequest) => fornecedoresApi.cadastrar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] })
      toast.success('Fornecedor cadastrado com sucesso.')
      navigate('/fornecedores')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useEditarFornecedor(id: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: FornecedorUpdateRequest) => fornecedoresApi.editar(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['fornecedores'] })
      await queryClient.invalidateQueries({ queryKey: ['fornecedores', 'detalhe', id] })
      toast.success('Fornecedor atualizado com sucesso.')
      navigate('/fornecedores')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDefinirAtivoFornecedor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DefinirAtivoRequest }) =>
      fornecedoresApi.definirAtivo(id, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['fornecedores'] })
      await queryClient.invalidateQueries({
        queryKey: ['fornecedores', 'detalhe', variables.id],
      })

      toast.success(
        variables.payload.ativo
          ? 'Fornecedor ativado com sucesso.'
          : 'Fornecedor inativado com sucesso.'
      )
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}