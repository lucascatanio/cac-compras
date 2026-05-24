import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import type { LoginFormData } from './schema'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginFormData) => authApi.login(data.username, data.senha),
    onSuccess: ({ token, usuario }) => {
      setAuth(token, usuario)
      navigate('/')
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { erro?: string } } }
      toast.error(err.response?.data?.erro ?? 'Erro ao fazer login.')
    },
  })
}
