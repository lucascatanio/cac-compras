import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UsuarioLogado } from '@/types/api'

interface AuthState {
  token: string | null
  usuario: UsuarioLogado | null
  setAuth: (token: string, usuario: UsuarioLogado) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      setAuth: (token, usuario) => set({ token, usuario }),
      clearAuth: () => set({ token: null, usuario: null }),
    }),
    { name: 'cac-auth' }
  )
)
