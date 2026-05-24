import { api } from '@/api/client'
import type {
  EntradaDetail,
  EntradaListItem,
  EntradaListParams,
  RegistrarEntradaRequest,
  RespostaPaginada,
} from '@/types/api'

export const entradasApi = {
  async listar(params: EntradaListParams) {
    const response = await api.get<RespostaPaginada<EntradaListItem>>('/entradas', { params })
    return response.data
  },

  async buscarPorId(id: number) {
    const response = await api.get<EntradaDetail>(`/entradas/${id}`)
    return response.data
  },

  async registrar(payload: RegistrarEntradaRequest) {
    const response = await api.post<{ id: number }>('/entradas', payload)
    return response.data
  },
}
