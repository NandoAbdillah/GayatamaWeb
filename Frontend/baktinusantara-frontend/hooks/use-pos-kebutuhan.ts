'use client';

import { useState, useEffect, useCallback } from 'react';
import posKebutuhanService, { PosKebutuhanQueryParams } from '@/lib/services/pos-kebutuhan.service';
import { PosKebutuhan } from '@/lib/types';
import { MOCK_POS_KEBUTUHAN } from '@/lib/mock-data';

export function usePosKebutuhan(initialParams?: PosKebutuhanQueryParams) {
  const [items, setItems] = useState<PosKebutuhan[]>(MOCK_POS_KEBUTUHAN);
  const [params, setParams] = useState<PosKebutuhanQueryParams | undefined>(initialParams);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (customParams?: PosKebutuhanQueryParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const activeParams = customParams !== undefined ? customParams : params;
      const data = await posKebutuhanService.getAll(activeParams);
      if (Array.isArray(data) && data.length > 0) {
        setItems(data);
      } else if (Array.isArray(data) && data.length === 0 && activeParams && Object.keys(activeParams).length > 0) {
        setItems([]);
      }
    } catch (err: any) {
      console.warn('Pos kebutuhan fetch error, keeping fallback data:', err);
      setError(err?.message || 'Gagal memuat katalog pos kebutuhan.');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const updateFilters = (newParams: PosKebutuhanQueryParams) => {
    setParams(newParams);
    fetchItems(newParams);
  };

  return {
    items,
    isLoading,
    error,
    params,
    setParams: updateFilters,
    refetch: () => fetchItems(params),
  };
}

export default usePosKebutuhan;
