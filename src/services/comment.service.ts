import api from './api'
import type { ApiResponse, Comment, CommentListParams, PaginatedResponse } from '../types'

export const commentService = {
  /**
   * Get comment list
   * GET /admin/comments
   */
  async getComments(params?: CommentListParams): Promise<PaginatedResponse<Comment>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Comment>>>('/admin/comments', {
      params,
    })
    return response.data.data!
  },

  /**
   * Get comment detail
   * GET /admin/comments/:id
   */
  async getComment(commentId: string): Promise<Comment> {
    const response = await api.get<ApiResponse<Comment>>(`/admin/comments/${commentId}`)
    return response.data.data!
  },

  /**
   * Delete single comment (physical delete)
   * DELETE /admin/comments/:id
   */
  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/admin/comments/${commentId}`)
  },

  /**
   * Bulk delete comments (physical delete)
   * POST /admin/comments/bulk-delete
   */
  async bulkDelete(ids: string[]): Promise<void> {
    await api.post('/admin/comments/bulk-delete', { ids })
  },
}
