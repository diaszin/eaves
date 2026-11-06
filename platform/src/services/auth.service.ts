import { http } from '@/lib/http'

export interface LoginResponse {
  access_token: string
  expires: number
}

export interface ProfileResponse {
  id: number
  email: string
  role: string
  profile: {
    fullname: string
    [key: string]: unknown
  }
}

export const authService = {
  login: (email: string, password: string) =>
    http
      .post<LoginResponse>('/auth/login', { email, password })
      .then((r) => r.data),

  getProfile: () =>
    http.get<ProfileResponse>('/auth/profile').then((r) => r.data),
}
