import api from './api'
import type { AdminRegisterPayload, ApiResponse, LoginResponse } from '../types'

export const authService = {
  /**
   * Register as admin using admin key
   */
  async registerAdmin(payload: AdminRegisterPayload): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/register-admin', payload)
    return response.data.data!
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    })
    return response.data.data!
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken }
    )
    return response.data.data!
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('adminUser')
    }
  },

  /**
   * Save auth data to localStorage
   */
  saveAuthData(data: LoginResponse): void {
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('adminUser', JSON.stringify(data.user))
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): LoginResponse['user'] | null {
    const userStr = localStorage.getItem('adminUser')
    return userStr ? JSON.parse(userStr) : null
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken')
  },
}
