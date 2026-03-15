import api from './api'
import type { ApiResponse, SystemStatistics } from '../types'

export const statisticsService = {
  /**
   * Get system statistics
   * GET /admin/statistics
   */
  async getStatistics(): Promise<SystemStatistics> {
    const response = await api.get<ApiResponse<SystemStatistics>>('/admin/statistics')
    return response.data.data!
  },
}
