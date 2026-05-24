import { api } from '@/api/client'
import type {
  RegistrarSaidaRequest,
  RespostaPaginada,
  SaidaDetail,
  SaidaListItem,
  SaidaListParams,
} from '@/types/api'

export const saidasApi = {
  async listar(params: SaidaListParams) {
    const response = await api.get<RespostaPaginada<SaidaListItem>>('/saidas', { params })
    return response.data
  },

  async buscarPorId(id: number) {
    const response = await api.get<SaidaDetail>(`/saidas/${id}`)
    return response.data
  },

  async registrar(payload: RegistrarSaidaRequest) {
    const response = await api.post<{ id: number }>('/saidas', payload)
    return response.data
  },
}
