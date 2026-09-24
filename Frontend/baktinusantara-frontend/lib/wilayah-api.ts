import {
  Province,
  Regency,
  District,
  Village,
  PostalCodeEntry,
  PolygonPath,
  WilayahStats,
  WilayahApiResponse,
  WilayahSearchResult,
} from './wilayah-types';

const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/v2';
const EDOPANDOYO_API_URL = 'https://wilayah.smartartstudio.my.id/api';
const LOGO_MINIO_BASE = 'https://wilayah.smartartstudio.my.id/wilayah-logo';
const LOGO_GITHUB_PROV_BASE = 'https://raw.githubusercontent.com/cahyadsn/wilayah_logo/main/prov/img';
const LOGO_GITHUB_KAB_BASE = 'https://raw.githubusercontent.com/cahyadsn/wilayah_logo/main/kab';

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
   * Helper: Resolusi URL Logo Resmi Provinsi (MinIO Storage edopandoyo/wilayah-indonesia-api)
   */
  getProvinceLogoUrl(provId: string): string {
    if (!provId) return '';
    const cleanId = provId.trim();
    return `${LOGO_MINIO_BASE}/${cleanId}.png`;
  },

  /**
   * Helper: Resolusi URL Logo Cadangan Provinsi (cahyadsn/wilayah_logo di GitHub Raw)
   */
  getProvinceFallbackLogoUrl(provId: string): string {
    if (!provId) return '';
    const cleanId = provId.trim();
    return `${LOGO_GITHUB_PROV_BASE}/${cleanId}.png`;
  },

  /**
   * Helper: Resolusi URL Logo Resmi Kabupaten / Kota (MinIO Storage edopandoyo/wilayah-indonesia-api)
   * Format kode: "32.01" atau "3201"
   */
  getRegencyLogoUrl(regId: string): string {
    if (!regId) return '';
    const cleanId = regId.trim();
    const formatted = cleanId.length === 4 && !cleanId.includes('.')
      ? `${cleanId.slice(0, 2)}.${cleanId.slice(2)}`
      : cleanId;
    return `${LOGO_MINIO_BASE}/${formatted}.png`;
  },

  /**
   * Helper: Resolusi URL Logo Cadangan Kab/Kota (cahyadsn/wilayah_logo di GitHub Raw)
   */
  getRegencyFallbackLogoUrl(regId: string, provId?: string): string {
    if (!regId) return '';
    const cleanId = regId.trim();
    const formatted = cleanId.length === 4 && !cleanId.includes('.')
      ? `${cleanId.slice(0, 2)}.${cleanId.slice(2)}`
      : cleanId;
    const parentProv = provId || formatted.split('.')[0] || '32';
    return `${LOGO_GITHUB_KAB_BASE}/${parentProv}/img/${formatted}.png`;
  },

  /**
   * Mengambil statistik ringkas wilayah nasional
   */
  async getStats(): Promise<WilayahStats> {
    return fetchFromWilayahApi<WilayahStats>('/stats.json');
  },

  /**
   * Mengambil seluruh 38 Provinsi di Indonesia lengkap dengan logo, ibukota, luas, populasi, dan titik koordinat
   */
  async getProvinces(): Promise<Province[]> {
    const provinces = await fetchFromWilayahApi<Province[]>('/provinces.json');
    return provinces.map((p) => ({
      ...p,
      logo_url: WilayahService.getProvinceLogoUrl(p.id),
      fallback_logo_url: WilayahService.getProvinceFallbackLogoUrl(p.id),
    }));
  },

  /**
   * Mengambil detail satu provinsi berdasarkan ID Kemendagri (misal: "32" untuk Jawa Barat)
   */
  async getProvinceById(id: string): Promise<Province> {
    const prov = await fetchFromWilayahApi<Province>(`/provinces/${id}.json`);
    return {
      ...prov,
      logo_url: WilayahService.getProvinceLogoUrl(prov.id),
      fallback_logo_url: WilayahService.getProvinceFallbackLogoUrl(prov.id),
    };
  },

  /**
   * Mengambil daftar Kabupaten / Kota di suatu provinsi lengkap dengan logo masing-masing
   */
  async getRegencies(provinceId: string): Promise<Regency[]> {
    const regencies = await fetchFromWilayahApi<Regency[]>(`/regencies/${provinceId}.json`);
    return regencies.map((r) => ({
      ...r,
      logo_url: WilayahService.getRegencyLogoUrl(r.id),
      fallback_logo_url: WilayahService.getRegencyFallbackLogoUrl(r.id, provinceId),
    }));
  },

  /**
   * Mengambil detail satu Kabupaten / Kota (misal: "32.73" untuk Kota Bandung)
   */
  async getRegencyById(regencyId: string): Promise<Regency> {
    const reg = await fetchFromWilayahApi<Regency>(`/regencies/${regencyId}.json`);
    return {
      ...reg,
      logo_url: WilayahService.getRegencyLogoUrl(reg.id),
      fallback_logo_url: WilayahService.getRegencyFallbackLogoUrl(reg.id),
    };
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
   * Helper: Mengambil nama wilayah berdasarkan kode Kemendagri dengan caching memori
   */
  async getWilayahNameByCode(code: string): Promise<string> {
    if (!code) return '';
    const cacheKey = `wilayah_name:${code.trim()}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as string;
    }

    try {
      const url = `${EDOPANDOYO_API_URL}/wilayah/${code.trim()}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(2000),
      });
      if (!res.ok) return '';
      const json = await res.json();
      const name = (json && json.nama) ? json.nama : '';
      memoryCache.set(cacheKey, { data: name, timestamp: Date.now() });
      return name;
    } catch {
      return '';
    }
  },

  /**
   * Pencarian wilayah live se-Indonesia dari edopandoyo/wilayah-indonesia-api
   * Menghasilkan list wilayah (Provinsi, Kab/Kota, Kecamatan, Desa) lengkap dengan hirarki nama lengkap dan kodepos
   */
  async searchWilayahFromApi(query: string): Promise<WilayahSearchResult> {
    if (!query || query.trim().length < 2) {
      return { data: [] };
    }

    const cacheKey = `search_wilayah:${query.toLowerCase().trim()}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as WilayahSearchResult;
    }

    try {
      const url = `${EDOPANDOYO_API_URL}/wilayah/search?name=${encodeURIComponent(query.trim())}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) {
        throw new Error(`Edopandoyo API Search Error ${res.status}`);
      }

      const json = await res.json();
      const rawData: any[] = Array.isArray(json) ? json : json.data || [];

      // Resolusi hirarki nama lengkap untuk setiap entitas wilayah
      const enrichedData = await Promise.all(
        rawData.slice(0, 10).map(async (item) => {
          const code = item.kode || '';
          const parts = code.split('.');

          let provName = '';
          let regName = '';
          let distName = '';
          let namaLengkap = item.nama;

          try {
            if (parts.length === 4) {
              // Level 4: Desa/Kelurahan
              [provName, regName, distName] = await Promise.all([
                WilayahService.getWilayahNameByCode(parts[0]),
                WilayahService.getWilayahNameByCode(`${parts[0]}.${parts[1]}`),
                WilayahService.getWilayahNameByCode(`${parts[0]}.${parts[1]}.${parts[2]}`),
              ]);
              const regLabel = regName.toLowerCase().startsWith('kabupaten') || regName.toLowerCase().startsWith('kota')
                ? regName
                : `Kab. ${regName}`;
              namaLengkap = `${item.nama}, Kec. ${distName}, ${regLabel}, ${provName}`;
            } else if (parts.length === 3) {
              // Level 3: Kecamatan
              [provName, regName] = await Promise.all([
                WilayahService.getWilayahNameByCode(parts[0]),
                WilayahService.getWilayahNameByCode(`${parts[0]}.${parts[1]}`),
              ]);
              const regLabel = regName.toLowerCase().startsWith('kabupaten') || regName.toLowerCase().startsWith('kota')
                ? regName
                : `Kab. ${regName}`;
              namaLengkap = `Kec. ${item.nama}, ${regLabel}, ${provName}`;
            } else if (parts.length === 2) {
              // Level 2: Kabupaten/Kota
              provName = await WilayahService.getWilayahNameByCode(parts[0]);
              namaLengkap = `${item.nama}, ${provName}`;
            }
          } catch (e) {
            console.warn(`Error resolving hierarchy for ${code}:`, e);
          }

          return {
            ...item,
            nama_lengkap: namaLengkap || item.nama,
            provinsi: provName,
            kabupaten: regName,
            kecamatan: distName,
          };
        })
      );

      const result: WilayahSearchResult = {
        data: enrichedData,
        meta: json.meta,
      };

      memoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (err) {
      console.warn('Fallback search from edopandoyo API:', err);
      return { data: [] };
    }
  },

  /**
   * Mengambil detail wilayah lengkap (centroid, polygon boundary, logo, kodepos) dari edopandoyo/wilayah-indonesia-api
   */
  async getWilayahDetailFromApi(code: string): Promise<any> {
    if (!code) return null;
    const cacheKey = `detail_wilayah:${code}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const url = `${EDOPANDOYO_API_URL}/wilayah/${code}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        throw new Error(`Edopandoyo API Detail Error ${res.status}`);
      }

      const json = await res.json();
      memoryCache.set(cacheKey, { data: json, timestamp: Date.now() });
      return json;
    } catch (err) {
      console.warn(`Detail fetch error for ${code}:`, err);
      return null;
    }
  },

  /**
   * Normalisasi koordinat path polygon untuk Leaflet Maps
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

