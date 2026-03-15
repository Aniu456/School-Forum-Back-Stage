import api from './api'
import type { ApiResponse, PaginatedResponse, Post, PostListParams } from '../types'

export const postService = {
  /**
   * Get post list
   * GET /admin/posts
   */
  async getPosts(params?: PostListParams): Promise<PaginatedResponse<Post>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Post>>>('/admin/posts', {
      params,
    })
    return response.data.data!
  },

  /**
   * Get post detail
   * GET /admin/posts/:id
   */
  async getPost(postId: string): Promise<Post> {
    const response = await api.get<ApiResponse<Post>>(`/admin/posts/${postId}`)
    return response.data.data!
  },

  /**
   * Pin post
   * POST /admin/posts/:id/pin
   */
  async pinPost(postId: string): Promise<void> {
    await api.post(`/admin/posts/${postId}/pin`)
  },

  /**
   * Unpin post
   * DELETE /admin/posts/:id/pin
   */
  async unpinPost(postId: string): Promise<void> {
    await api.delete(`/admin/posts/${postId}/pin`)
  },

  /**
   * Highlight post
   * POST /admin/posts/:id/highlight
   */
  async highlightPost(postId: string): Promise<void> {
    await api.post(`/admin/posts/${postId}/highlight`)
  },

  /**
   * Remove highlight from post
   * DELETE /admin/posts/:id/highlight
   */
  async unhighlightPost(postId: string): Promise<void> {
    await api.delete(`/admin/posts/${postId}/highlight`)
  },

  /**
   * Lock post (disable comments)
   * POST /admin/posts/:id/lock
   */
  async lockPost(postId: string): Promise<void> {
    await api.post(`/admin/posts/${postId}/lock`)
  },

  /**
   * Unlock post
   * DELETE /admin/posts/:id/lock
   */
  async unlockPost(postId: string): Promise<void> {
    await api.delete(`/admin/posts/${postId}/lock`)
  },

  /**
   * Hide post
   * POST /admin/posts/:id/hide
   */
  async hidePost(postId: string): Promise<void> {
    await api.post(`/admin/posts/${postId}/hide`)
  },

  /**
   * Unhide post
   * POST /admin/posts/:id/unhide
   */
  async unhidePost(postId: string): Promise<void> {
    await api.post(`/admin/posts/${postId}/unhide`)
  },

  /**
   * Bulk delete posts (physical delete)
   * POST /admin/posts/bulk-delete
   */
  async bulkDelete(ids: string[]): Promise<void> {
    await api.post('/admin/posts/bulk-delete', { ids })
  },
}
