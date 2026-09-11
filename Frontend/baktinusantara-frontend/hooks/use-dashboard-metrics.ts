'use client';

import { useState, useEffect, useCallback } from 'react';
import dashboardService from '@/lib/services/dashboard.service';
import { NationalMetrics } from '@/lib/types';

const FALLBACK_METRICS: NationalMetrics = {
  total_desa_terbantu: 128,
  total_umkm_terdigitalisasi: 342,
  total_kelompok_kkn: 85,
  total_mahasiswa_terlibat: 850,
  total_jam_pengabdian: 40800,
  total_pos_kebutuhan: 164,
  status_pos_breakdown: {
    open: 42,
    in_progress: 85,
    completed: 37,
  },
  total_luaran_terverifikasi: 37,
  total_portofolio_publik: 37,
  kategori_breakdown: {
    umkm: 45,
    lingkungan: 32,
    kesehatan: 30,
    pendidikan: 35,
    fasilitas: 22,
  },
  sdgs_distribution: {
    'SDG 1': 15,
    'SDG 3': 30,
    'SDG 4': 35,
    'SDG 8': 45,
    'SDG 9': 28,
    'SDG 11': 20,
    'SDG 13': 32,
  },
};

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<NationalMetrics>(FALLBACK_METRICS);
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
      console.warn('Dashboard metrics fetch error, keeping fallback data:', err);
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
