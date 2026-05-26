import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
})

// Injeta o token em toda requisição
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 -> limpa store e redireciona para login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
