import { api } from '@/api/client'
import type {
  CreatedIdResponse,
  DefinirAtivoRequest,
  ProdutoCreateRequest,
  ProdutoDetail,
  ProdutoListItem,
  ProdutoListParams,
  ProdutoUpdateRequest,
  RespostaPaginada,
} from '@/types/api'

export const produtosApi = {
  async listar(params: ProdutoListParams) {
    const response = await api.get<RespostaPaginada<ProdutoListItem>>('/produtos', { params })
    return response.data
  },

  async buscarPorId(id: number) {
    const response = await api.get<ProdutoDetail>(`/produtos/${id}`)
    return response.data
  },

  async cadastrar(payload: ProdutoCreateRequest) {
    const response = await api.post<CreatedIdResponse>('/produtos', payload)
    return response.data
  },

  async editar(id: number, payload: ProdutoUpdateRequest) {
    await api.put(`/produtos/${id}`, payload)
  },

  async definirAtivo(id: number, payload: DefinirAtivoRequest) {
    await api.patch(`/produtos/${id}/ativo`, payload)
  },
}
