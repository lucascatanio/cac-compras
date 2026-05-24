import { api } from './client'
import type { LoginResponse, UsuarioLogado } from '@/types/api'

export const authApi = {
  login: async (username: string, senha: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/api/auth/login', { username, senha })
    return data
  },

  me: async (): Promise<UsuarioLogado> => {
    const { data } = await api.get<UsuarioLogado>('/api/auth/me')
    return data
  },
}
