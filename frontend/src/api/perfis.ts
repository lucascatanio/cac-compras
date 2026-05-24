import { api } from '@/api/client'
import type { PerfilListItem } from '@/types/api'

export const perfisApi = {
  async listar() {
    const response = await api.get<PerfilListItem[]>('/perfis')
    return response.data
  },
}
