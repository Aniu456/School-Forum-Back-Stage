import api from './api'
import type { Announcement, AnnouncementInput, ApiResponse, PaginatedResponse } from '../types'

export const announcementService = {
  /**
   * Create announcement
   * POST /announcements
   */
  async createAnnouncement(data: AnnouncementInput): Promise<Announcement> {
    const response = await api.post<ApiResponse<Announcement>>('/announcements', data)
    return response.data.data!
  },

  /**
   * Get announcement list (public)
   * GET /announcements
   */
  async getAnnouncements(params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Announcement>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Announcement>>>(
      '/announcements',
      { params }
    )
    return response.data.data!
  },

  /**
   * Get all announcements (admin view)
   * GET /announcements/admin/all
   */
  async getAllAnnouncements(params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Announcement>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Announcement>>>(
      '/announcements/admin/all',
      { params }
    )
    return response.data.data!
  },

  /**
   * Get announcement detail
   * GET /announcements/:id
   */
  async getAnnouncement(id: string): Promise<Announcement> {
    const response = await api.get<ApiResponse<Announcement>>(`/announcements/${id}`)
    return response.data.data!
  },

  /**
   * Update announcement
   * PUT /announcements/:id
   */
  async updateAnnouncement(id: string, data: Partial<AnnouncementInput>): Promise<Announcement> {
    const response = await api.put<ApiResponse<Announcement>>(`/announcements/${id}`, data)
    return response.data.data!
  },

  /**
   * Delete announcement (physical delete)
   * DELETE /announcements/:id
   */
  async deleteAnnouncement(id: string): Promise<void> {
    await api.delete(`/announcements/${id}`)
  },

  /**
   * Toggle hidden status
   * PATCH /announcements/:id/toggle-hidden
   */
  async toggleHidden(id: string, isHidden: boolean): Promise<Announcement> {
    const response = await api.patch<ApiResponse<Announcement>>(
      `/announcements/${id}/toggle-hidden`,
      { isHidden }
    )
    return response.data.data!
  },

  /**
   * Bulk delete announcements
   * POST /announcements/admin/bulk-delete
   */
  async bulkDelete(ids: string[]): Promise<void> {
    await api.post('/announcements/admin/bulk-delete', { ids })
  },
}
