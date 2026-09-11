import apiClient from '@/lib/api-client';
import { NationalMetrics } from '@/lib/types';

export const dashboardService = {
  /**
   * Get national impact metrics for landing page counters & stats
   * Endpoint: GET /api/dashboard/metrics (Public)
   */
  async getMetrics(): Promise<NationalMetrics> {
    const res = await apiClient.get<{
      message?: string;
      data: NationalMetrics;
    }>('/api/dashboard/metrics');

    // Return inner data if nested, or response data directly
    return res.data?.data || (res.data as unknown as NationalMetrics);
  },
};

export default dashboardService;
