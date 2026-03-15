import api from './api'
import type { ApiResponse, PaginatedResponse, User, UserListParams, UserLoginHistory } from '../types'

export const userService = {
  /**
   * Get user list
   * GET /admin/users
   */
  async getUsers(params?: UserListParams): Promise<PaginatedResponse<User>> {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', {
      params,
    })
    return response.data.data!
  },

  /**
   * Ban user
   * POST /admin/users/:id/ban
   */
  async banUser(userId: string, reason?: string): Promise<User> {
    const response = await api.post<ApiResponse<{ user: User }>>(
      `/admin/users/${userId}/ban`,
      { reason }
    )
    return response.data.data!.user
  },

  /**
   * Unban user
   * POST /admin/users/:id/unban
   */
  async unbanUser(userId: string): Promise<User> {
    const response = await api.post<ApiResponse<{ user: User }>>(`/admin/users/${userId}/unban`)
    return response.data.data!.user
  },

  /**
   * Delete user (physical delete)
   * DELETE /admin/users/:id
   */
  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`)
  },

  /**
   * Reset user password
   * POST /admin/users/:id/reset-password
   */
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    await api.post(`/admin/users/${userId}/reset-password`, { newPassword })
  },

  /**
   * Change user role
   * PATCH /admin/users/:id/role
   */
  async changeRole(userId: string, role: 'USER' | 'ADMIN'): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(`/admin/users/${userId}/role`, { role })
    return response.data.data!
  },

  /**
   * Get user login history
   * GET /admin/users/:id/login-history
   */
  async getLoginHistory(
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<UserLoginHistory>> {
    const response = await api.get<ApiResponse<PaginatedResponse<UserLoginHistory>>>(
      `/admin/users/${userId}/login-history`,
      { params }
    )
    return response.data.data!
  },

  /**
   * Toggle post permission
   * POST /admin/users/:id/toggle-post-permission
   * Note: backend DTO requires both canPost and canComment fields
   */
  async togglePostPermission(userId: string, canPost: boolean, canComment: boolean): Promise<void> {
    await api.post(`/admin/users/${userId}/toggle-post-permission`, { canPost, canComment })
  },

  /**
   * Toggle comment permission
   * POST /admin/users/:id/toggle-comment-permission
   * Note: backend DTO requires both canPost and canComment fields
   */
  async toggleCommentPermission(userId: string, canComment: boolean, canPost: boolean): Promise<void> {
    await api.post(`/admin/users/${userId}/toggle-comment-permission`, { canPost, canComment })
  },
}
