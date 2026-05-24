import { api } from '@/api/client'
import type {
  CreatedIdResponse,
  DefinirAtivoRequest,
  SetorCreateRequest,
  SetorDetail,
  SetorListItem,
  SetorListParams,
  SetorUpdateRequest,
} from '@/types/api'

export const setoresApi = {
  async listar(params: SetorListParams) {
    const response = await api.get<SetorListItem[]>('/setores', { params })
    return response.data
  },

  async buscarPorId(id: number) {
    const response = await api.get<SetorDetail>(`/setores/${id}`)
    return response.data
  },

  async cadastrar(payload: SetorCreateRequest) {
    const response = await api.post<CreatedIdResponse>('/setores', payload)
    return response.data
  },

  async editar(id: number, payload: SetorUpdateRequest) {
    await api.put(`/setores/${id}`, payload)
  },

  async definirAtivo(id: number, payload: DefinirAtivoRequest) {
    await api.patch(`/setores/${id}/ativo`, payload)
  },
}
