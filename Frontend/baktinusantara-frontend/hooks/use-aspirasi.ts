'use client';

import { useState, useEffect, useCallback } from 'react';
import aspirasiService, { DecideAspirasiPayload, SubmitAspirasiPayload } from '@/lib/services/aspirasi.service';
import { Aspirasi } from '@/lib/types';
export function useAspirasi() {
  const [aspirasiList, setAspirasiList] = useState<Aspirasi[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDesaAspirasi = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await aspirasiService.getByDesa();
      if (Array.isArray(data)) {
        setAspirasiList(data);
      } else {
        setAspirasiList([]);
      }
    } catch (err: any) {
      console.error('Aspirasi desa fetch error:', err);
      setError(err?.message || 'Gagal memuat daftar aspirasi.');
      setAspirasiList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDesaAspirasi();
  }, [fetchDesaAspirasi]);

  const submitPublicAspirasi = async (payload: SubmitAspirasiPayload | FormData) => {
    return await aspirasiService.submitAspirasi(payload);
  };

  const trackTicket = async (ticket: string | number) => {
    return await aspirasiService.getByTicket(ticket);
  };

  const decideAspirasi = async (id: number | string, decision: DecideAspirasiPayload) => {
    const res = await aspirasiService.decide(id, decision);
    await fetchDesaAspirasi();
    return res;
  };

  return {
    aspirasiList,
    isLoading,
    error,
    submitPublicAspirasi,
    trackTicket,
    decideAspirasi,
    refetch: fetchDesaAspirasi,
  };
}

export default useAspirasi;
