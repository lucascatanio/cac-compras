import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { produtosApi } from '@/api/produtos'
import type {
  DefinirAtivoRequest,
  ProdutoCreateRequest,
  ProdutoListParams,
  ProdutoUpdateRequest,
} from '@/types/api'

function getErrorMessage(error: unknown) {
  const err = error as { response?: { data?: { erro?: string } } }
  return err.response?.data?.erro ?? 'Ocorreu um erro na operação.'
}

export function useProdutos(params: ProdutoListParams) {
  return useQuery({
    queryKey: ['produtos', params],
    queryFn: () => produtosApi.listar(params),
  })
}

export function useProduto(id?: number) {
  return useQuery({
    queryKey: ['produtos', 'detalhe', id],
    queryFn: () => produtosApi.buscarPorId(id as number),
    enabled: Boolean(id),
  })
}

export function useCadastrarProduto() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: ProdutoCreateRequest) => produtosApi.cadastrar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      toast.success('Produto cadastrado com sucesso.')
      navigate('/produtos')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useEditarProduto(id: number) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: ProdutoUpdateRequest) => produtosApi.editar(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['produtos'] })
      await queryClient.invalidateQueries({ queryKey: ['produtos', 'detalhe', id] })
      toast.success('Produto atualizado com sucesso.')
      navigate('/produtos')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useDefinirAtivoProduto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DefinirAtivoRequest }) =>
      produtosApi.definirAtivo(id, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['produtos'] })
      await queryClient.invalidateQueries({
        queryKey: ['produtos', 'detalhe', variables.id],
      })
      toast.success(
        variables.payload.ativo
          ? 'Produto ativado com sucesso.'
          : 'Produto inativado com sucesso.'
      )
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
