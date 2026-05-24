import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { entradasApi } from '@/api/entradas'
import type { EntradaListParams, RegistrarEntradaRequest } from '@/types/api'

function getErrorMessage(error: unknown) {
  const err = error as { response?: { data?: { erro?: string } } }
  return err.response?.data?.erro ?? 'Ocorreu um erro na operação.'
}

export function useEntradas(params: EntradaListParams) {
  return useQuery({
    queryKey: ['entradas', params],
    queryFn: () => entradasApi.listar(params),
  })
}

export function useEntrada(id?: number) {
  return useQuery({
    queryKey: ['entradas', 'detalhe', id],
    queryFn: () => entradasApi.buscarPorId(id as number),
    enabled: Boolean(id),
  })
}

export function useRegistrarEntrada() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegistrarEntradaRequest) => entradasApi.registrar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entradas'] })
      queryClient.invalidateQueries({ queryKey: ['produtos'] })
      toast.success('Entrada registrada com sucesso.')
      navigate('/entradas')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
