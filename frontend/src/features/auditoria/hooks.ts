import { useQuery } from '@tanstack/react-query'
import { auditoriaApi } from '@/api/auditoria'
import type { AuditoriaParams } from '@/types/api'

export function useAuditoria(params: AuditoriaParams) {
  return useQuery({
    queryKey: ['auditoria', params],
    queryFn: () => auditoriaApi.listar(params),
  })
}
