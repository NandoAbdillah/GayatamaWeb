'use client';

import { useState, useEffect, useCallback } from 'react';
import dashboardService from '@/lib/services/dashboard.service';
import { NationalMetrics } from '@/lib/types';

const EMPTY_METRICS: NationalMetrics = {
  total_desa_terbantu: 0,
  total_umkm_terdigitalisasi: 0,
  total_kelompok_kkn: 0,
  total_mahasiswa_terlibat: 0,
  total_jam_pengabdian: 0,
  total_pos_kebutuhan: 0,
  status_pos_breakdown: {
    open: 0,
    in_progress: 0,
    completed: 0,
  },
  total_luaran_terverifikasi: 0,
  total_portofolio_publik: 0,
  kategori_breakdown: {},
  sdgs_distribution: {},
};

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<NationalMetrics>(EMPTY_METRICS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getMetrics();
      if (data && typeof data === 'object') {
        setMetrics(data);
      }
    } catch (err: any) {
      console.error('Dashboard metrics fetch error:', err);
      setError(err?.message || 'Gagal memuat metrik dampak.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics,
  };
}

export default useDashboardMetrics;
