import axios from 'axios'

let accessToken: string | null = null
let onUnauthorized: (() => void) | null = null

export function setToken(token: string | null) {
  accessToken = token
}

export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  timeout: 10_000,
})

http.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    // Apenas 401 (Unauthorized) significa token inválido/expirado e deve encerrar a sessão.
    // 403 (Forbidden) significa apenas permissão negada para o endpoint específico.
    if (error.response?.status === 401 && accessToken) {
      setToken(null)
      onUnauthorized?.()
    }
    return Promise.reject(error)
  },
)
