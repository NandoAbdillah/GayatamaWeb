import {
  Province,
  Regency,
  District,
  Village,
  PostalCodeEntry,
  PolygonPath,
  WilayahStats,
  WilayahApiResponse,
} from './wilayah-types';

const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/v2';

// In-memory cache to prevent redundant HTTP requests
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour TTL

async function fetchFromWilayahApi<T>(endpoint: string): Promise<T> {
  const cacheKey = `wilayah:${endpoint}`;
  const cached = memoryCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  try {
    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 3600 }, // Next.js fetch cache support
    });

    if (!res.ok) {
      throw new Error(`Wilayah API HTTP Error ${res.status}: ${res.statusText}`);
    }

    const json: WilayahApiResponse<T> = await res.json();
    memoryCache.set(cacheKey, { data: json.data, timestamp: Date.now() });
    return json.data;
  } catch (error) {
    console.error(`Failed to fetch from Wilayah API (${endpoint}):`, error);
    throw error;
  }
}

export const WilayahService = {
  /**
   * Mengambil statistik ringkas wilayah nasional
   */
  async getStats(): Promise<WilayahStats> {
    return fetchFromWilayahApi<WilayahStats>('/stats.json');
  },

  /**
   * Mengambil seluruh 38 Provinsi di Indonesia lengkap dengan ibukota, luas, populasi, dan titik koordinat
   */
  async getProvinces(): Promise<Province[]> {
    return fetchFromWilayahApi<Province[]>('/provinces.json');
  },

  /**
   * Mengambil detail satu provinsi berdasarkan ID Kemendagri (misal: "32" untuk Jawa Barat)
   */
  async getProvinceById(id: string): Promise<Province> {
    return fetchFromWilayahApi<Province>(`/provinces/${id}.json`);
  },

  /**
   * Mengambil daftar Kabupaten / Kota di suatu provinsi (misal: "32" untuk Kab/Kota di Jawa Barat)
   */
  async getRegencies(provinceId: string): Promise<Regency[]> {
    return fetchFromWilayahApi<Regency[]>(`/regencies/${provinceId}.json`);
  },

  /**
   * Mengambil detail satu Kabupaten / Kota (misal: "32.73" untuk Kota Bandung)
   */
  async getRegencyById(regencyId: string): Promise<Regency> {
    return fetchFromWilayahApi<Regency>(`/regencies/${regencyId}.json`);
  },

  /**
   * Mengambil daftar Kecamatan di suatu Kabupaten / Kota (misal: "32.73" untuk Kecamatan di Kota Bandung)
   */
  async getDistricts(regencyId: string): Promise<District[]> {
    return fetchFromWilayahApi<District[]>(`/districts/${regencyId}.json`);
  },

  /**
   * Mengambil detail satu Kecamatan
   */
  async getDistrictById(districtId: string): Promise<District> {
    return fetchFromWilayahApi<District>(`/districts/${districtId}.json`);
  },

  /**
   * Mengambil daftar Desa / Kelurahan di suatu Kecamatan beserta kode pos dan titik koordinat
   */
  async getVillages(districtId: string): Promise<Village[]> {
    return fetchFromWilayahApi<Village[]>(`/villages/${districtId}.json`);
  },

  /**
   * Mengambil detail satu Desa / Kelurahan
   */
  async getVillageById(villageId: string): Promise<Village> {
    return fetchFromWilayahApi<Village>(`/villages/${villageId}.json`);
  },

  /**
   * Mencari daftar desa/kelurahan berdasarkan Kode Pos (misal: "40152")
   */
  async getVillagesByPostalCode(postalCode: string): Promise<PostalCodeEntry[]> {
    return fetchFromWilayahApi<PostalCodeEntry[]>(`/postal-codes/${postalCode}.json`);
  },

  /**
   * Mengambil garis batas wilayah (Polygon path) untuk di-render di Leaflet/Peta Geospasial
   */
  async getRegionPath(regionId: string): Promise<PolygonPath> {
    return fetchFromWilayahApi<PolygonPath>(`/paths/${regionId}.json`);
  },

  /**
   * Normalisasi koordinat path polygon untuk Leaflet Maps
   * Format input path bisa:
   * 1. Single Ring: [[lat, lng], [lat, lng], ...]
   * 2. Multi-Polygon: [[[lat, lng], ...], [[lat, lng], ...]]
   */
  normalizeLeafletPositions(rawPath: any): [number, number][][] | [number, number][][][] {
    if (!rawPath || !Array.isArray(rawPath) || rawPath.length === 0) {
      return [];
    }

    // Cek apakah elemen pertama adalah tuple titik [lat, lng]
    if (typeof rawPath[0][0] === 'number') {
      return [rawPath as [number, number][]];
    }

    // Jika sudah berupa array of rings/polygons
    return rawPath as [number, number][][];
  },
};
