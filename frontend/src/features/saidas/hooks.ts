import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { saidasApi } from '@/api/saidas'
import type { RegistrarSaidaRequest, SaidaListParams } from '@/types/api'

function getErrorMessage(error: unknown) {
  const err = error as { response?: { data?: { erro?: string } } }
  return err.response?.data?.erro ?? 'Ocorreu um erro na operação.'
}

export function useSaidas(params: SaidaListParams) {
  return useQuery({
    queryKey: ['saidas', params],
    queryFn: () => saidasApi.listar(params),
  })
}

export function useSaida(id?: number) {
  return useQuery({
    queryKey: ['saidas', 'detalhe', id],
    queryFn: () => saidasApi.buscarPorId(id as number),
    enabled: Boolean(id),
  })
}

export function useRegistrarSaida() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegistrarSaidaRequest) => saidasApi.registrar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saidas'] })
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      toast.success('Saída registrada com sucesso.')
      navigate('/saidas')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
