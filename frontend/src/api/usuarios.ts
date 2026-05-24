import { api } from '@/api/client'
import type {
  CreatedIdResponse,
  DefinirAtivoRequest,
  RespostaPaginada,
  UsuarioChangePasswordRequest,
  UsuarioCreateRequest,
  UsuarioDetail,
  UsuarioListItem,
  UsuarioListParams,
  UsuarioUpdateRequest,
} from '@/types/api'

export const usuariosApi = {
  async listar(params: UsuarioListParams) {
    const response = await api.get<RespostaPaginada<UsuarioListItem>>('/usuarios', { params })
    return response.data
  },

  async buscarPorId(id: number) {
    const response = await api.get<UsuarioDetail>(`/usuarios/${id}`)
    return response.data
  },

  async cadastrar(payload: UsuarioCreateRequest) {
    const response = await api.post<CreatedIdResponse>('/usuarios', payload)
    return response.data
  },

  async editar(id: number, payload: UsuarioUpdateRequest) {
    await api.put(`/usuarios/${id}`, payload)
  },

  async alterarSenha(id: number, payload: UsuarioChangePasswordRequest) {
    await api.patch(`/usuarios/${id}/senha`, payload)
  },

  async definirAtivo(id: number, payload: DefinirAtivoRequest) {
    await api.patch(`/usuarios/${id}/ativo`, payload)
  },
}
