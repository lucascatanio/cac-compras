import { api } from '@/api/client'
import type {
  CreatedIdResponse,
  DefinirAtivoRequest,
  FornecedorCreateRequest,
  FornecedorDetail,
  FornecedorListItem,
  FornecedorListParams,
  FornecedorUpdateRequest,
  RespostaPaginada,
} from '@/types/api'

export const fornecedoresApi = {
  async listar(params: FornecedorListParams) {
    const response = await api.get<RespostaPaginada<FornecedorListItem>>('/fornecedores', {
      params,
    })
    return response.data
  },

  async buscarPorId(id: number) {
    const response = await api.get<FornecedorDetail>(`/fornecedores/${id}`)
    return response.data
  },

  async cadastrar(payload: FornecedorCreateRequest) {
    const response = await api.post<CreatedIdResponse>('/fornecedores', payload)
    return response.data
  },

  async editar(id: number, payload: FornecedorUpdateRequest) {
    await api.put(`/fornecedores/${id}`, payload)
  },

  async definirAtivo(id: number, payload: DefinirAtivoRequest) {
    await api.patch(`/fornecedores/${id}/ativo`, payload)
  },
}