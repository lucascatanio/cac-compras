import { api } from '@/api/client'
import type { AuditoriaItem, AuditoriaParams, RespostaPaginada } from '@/types/api'

export const auditoriaApi = {
  async listar(params: AuditoriaParams) {
    const response = await api.get<RespostaPaginada<AuditoriaItem>>('/auditoria', { params })
    return response.data
  },
}
