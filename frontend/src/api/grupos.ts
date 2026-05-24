import { api } from '@/api/client'
import type {
  CreatedIdResponse,
  GrupoCreateRequest,
  GrupoDetail,
  GrupoListItem,
  GrupoListParams,
  GrupoUpdateRequest,
} from '@/types/api'

export const gruposApi = {
  async listar(params: GrupoListParams) {
    const response = await api.get<GrupoListItem[]>('/grupos', { params })
    return response.data
  },

  async buscarPorId(id: number) {
    const response = await api.get<GrupoDetail>(`/grupos/${id}`)
    return response.data
  },

  async cadastrar(payload: GrupoCreateRequest) {
    const response = await api.post<CreatedIdResponse>('/grupos', payload)
    return response.data
  },

  async editar(id: number, payload: GrupoUpdateRequest) {
    await api.put(`/grupos/${id}`, payload)
  },
}
