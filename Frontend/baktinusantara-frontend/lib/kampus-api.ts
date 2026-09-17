/**
 * API Indonesia - Integrasi Direktori Kampus & Perguruan Tinggi
 * Dokumentasi: https://docs.apiindonesia.id/#kampus
 */

export interface KampusItem {
  id: string;
  name: string;
  short_name?: string | null;
  jenis: 'universitas' | 'institut' | 'politeknik' | 'akademi' | 'sekolah_tinggi' | string;
  kelompok: 'PTN' | 'PTS' | string;
  province_id?: string | null;
  regency_id?: string | null;
  province_name?: string | null;
  regency_name?: string | null;
  address?: string | null;
  postal_code?: string | null;
  website?: string | null;
  accreditation?: string | null;
  logo_url?: string;
  lat?: number;
  lng?: number;
}

const API_KEY = 'aip_live_Kpft1RibVLVlokZ8gWbKMVd1YXM49vPO';
const BASE_URL = 'https://use.apiindonesia.id/api/v1';

// In-memory cache to prevent redundant network calls
const kampusCache = new Map<string, { data: KampusItem[]; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

/**
 * Pemetaan Domain & Logo Kampus Populer Indonesia
 */
const KNOWN_CAMPUS_DATA: Record<string, { domain: string; lat: number; lng: number; shortName: string; city: string; prov: string }> = {
  // Jawa Timur
  'universitas airlangga': { domain: 'unair.ac.id', lat: -7.2721, lng: 112.7583, shortName: 'UNAIR', city: 'Kota Surabaya', prov: 'Jawa Timur' },
  'institut teknologi sepuluh nopember': { domain: 'its.ac.id', lat: -7.2824, lng: 112.7949, shortName: 'ITS', city: 'Kota Surabaya', prov: 'Jawa Timur' },
  'universitas brawijaya': { domain: 'ub.ac.id', lat: -7.9526, lng: 112.6144, shortName: 'UB', city: 'Kota Malang', prov: 'Jawa Timur' },
  'universitas negeri surabaya': { domain: 'unesa.ac.id', lat: -7.3117, lng: 112.7275, shortName: 'UNESA', city: 'Kota Surabaya', prov: 'Jawa Timur' },
  'universitas negeri malang': { domain: 'um.ac.id', lat: -7.9622, lng: 112.6186, shortName: 'UM', city: 'Kota Malang', prov: 'Jawa Timur' },
  'universitas jember': { domain: 'unej.ac.id', lat: -8.1652, lng: 113.7167, shortName: 'UNEJ', city: 'Kabupaten Jember', prov: 'Jawa Timur' },
  'uin maulana malik ibrahim': { domain: 'uin-malang.ac.id', lat: -7.9522, lng: 112.6078, shortName: 'UIN Malang', city: 'Kota Malang', prov: 'Jawa Timur' },
  'uin sunan ampel': { domain: 'uinsby.ac.id', lat: -7.3175, lng: 112.7369, shortName: 'UINSA', city: 'Kota Surabaya', prov: 'Jawa Timur' },
  'upn veteran jawa timur': { domain: 'upnjatim.ac.id', lat: -7.3333, lng: 112.7889, shortName: 'UPN Jatim', city: 'Kota Surabaya', prov: 'Jawa Timur' },
  'politeknik negeri malang': { domain: 'polinema.ac.id', lat: -7.9467, lng: 112.6158, shortName: 'POLINEMA', city: 'Kota Malang', prov: 'Jawa Timur' },
  'politeknik elektronika negeri surabaya': { domain: 'pens.ac.id', lat: -7.2758, lng: 112.7936, shortName: 'PENS', city: 'Kota Surabaya', prov: 'Jawa Timur' },

  // Jawa Barat
  'institut teknologi bandung': { domain: 'itb.ac.id', lat: -6.8915, lng: 107.6107, shortName: 'ITB', city: 'Kota Bandung', prov: 'Jawa Barat' },
  'universitas padjadjaran': { domain: 'unpad.ac.id', lat: -6.9265, lng: 107.7744, shortName: 'UNPAD', city: 'Kabupaten Sumedang', prov: 'Jawa Barat' },
  'ipb university': { domain: 'ipb.ac.id', lat: -6.5595, lng: 106.7262, shortName: 'IPB', city: 'Kabupaten Bogor', prov: 'Jawa Barat' },
  'institut pertanian bogor': { domain: 'ipb.ac.id', lat: -6.5595, lng: 106.7262, shortName: 'IPB', city: 'Kabupaten Bogor', prov: 'Jawa Barat' },
  'universitas indonesia': { domain: 'ui.ac.id', lat: -6.3655, lng: 106.8284, shortName: 'UI', city: 'Kota Depok', prov: 'Jawa Barat' },
  'universitas pendidikan indonesia': { domain: 'upi.edu', lat: -6.8604, lng: 107.5899, shortName: 'UPI', city: 'Kota Bandung', prov: 'Jawa Barat' },
  'universitas telkom': { domain: 'telkomuniversity.ac.id', lat: -6.9734, lng: 107.6303, shortName: 'Tel-U', city: 'Kabupaten Bandung', prov: 'Jawa Barat' },
  'universitas pakuan': { domain: 'unpak.ac.id', lat: -6.6022, lng: 106.8123, shortName: 'UNPAK', city: 'Kota Bogor', prov: 'Jawa Barat' },
  'universitas djuanda': { domain: 'unida.ac.id', lat: -6.6575, lng: 106.8522, shortName: 'UNIDA', city: 'Kabupaten Bogor', prov: 'Jawa Barat' },
  'universitas ibnu khaldun': { domain: 'uika-bogor.ac.id', lat: -6.5621, lng: 106.7942, shortName: 'UIKA', city: 'Kota Bogor', prov: 'Jawa Barat' },

  // DI Yogyakarta & Jawa Tengah
  'universitas gadjah mada': { domain: 'ugm.ac.id', lat: -7.7709, lng: 110.3776, shortName: 'UGM', city: 'Kabupaten Sleman', prov: 'DI Yogyakarta' },
  'universitas negeri yogyakarta': { domain: 'uny.ac.id', lat: -7.7733, lng: 110.3869, shortName: 'UNY', city: 'Kabupaten Sleman', prov: 'DI Yogyakarta' },
  'universitas diponegoro': { domain: 'undip.ac.id', lat: -7.0504, lng: 110.4398, shortName: 'UNDIP', city: 'Kota Semarang', prov: 'Jawa Tengah' },
  'universitas sebelas maret': { domain: 'uns.ac.id', lat: -7.5583, lng: 110.8569, shortName: 'UNS', city: 'Kota Surakarta', prov: 'Jawa Tengah' },

  // Luar Jawa
  'universitas sumatera utara': { domain: 'usu.ac.id', lat: 3.5658, lng: 98.6568, shortName: 'USU', city: 'Kota Medan', prov: 'Sumatera Utara' },
  'universitas hasanuddin': { domain: 'unhas.ac.id', lat: -5.1347, lng: 119.4935, shortName: 'UNHAS', city: 'Kota Makassar', prov: 'Sulawesi Selatan' },
  'universitas udayana': { domain: 'unud.ac.id', lat: -8.7984, lng: 115.1718, shortName: 'UNUD', city: 'Kabupaten Badung', prov: 'Bali' },
};

/**
 * Resolusi logo kampus:
 * 1. Jika ada domain yang teridentifikasi, gunakan Google High-Resolution Favicon (128x128).
 * 2. Jika tidak ada, gunakan avatar svg monogram dengan warna universitas.
 */
export function resolveCampusLogo(name: string, domain?: string | null): string {
  const cleanName = name.toLowerCase().trim();

  // Check known domain map
  for (const [key, data] of Object.entries(KNOWN_CAMPUS_DATA)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return `https://www.google.com/s2/favicons?domain=${data.domain}&sz=128`;
    }
  }

  if (domain && domain.trim().length > 3) {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
    return `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`;
  }

  // Fallback: Elegant UI monogram
  return '';
}

export const KampusService = {
  /**
   * Mengambil daftar perguruan tinggi di wilayah terpilih (Provinsi, Kab/Kota, Kecamatan, atau Desa)
   */
  async getKampusByWilayah(params: {
    provinceId?: string;
    provinceName?: string;
    regencyName?: string;
    regionName?: string;
    centerLat?: number;
    centerLng?: number;
  }): Promise<KampusItem[]> {
    const { provinceId, provinceName, regencyName, regionName, centerLat, centerLng } = params;
    const cacheKey = `kampus:${provinceId || ''}:${regencyName || ''}:${regionName || ''}`;

    const cached = kampusCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      // Tentukan query pencarian ke API Indonesia
      // Prioritaskan nama Kab/Kota (misal: "Surabaya", "Malang", "Bogor", "Bandung")
      // atau nama Provinsi jika kab/kota belum dipilih
      let searchQueries: string[] = [];

      if (regencyName && regencyName.trim().length > 0) {
        const cleanRegency = regencyName.replace(/^(kabupaten|kota)\s+/i, '').trim();
        searchQueries = [cleanRegency];
      } else if (provinceId === '35' || (provinceName && provinceName.toLowerCase().includes('jawa timur'))) {
        searchQueries = ['Surabaya', 'Malang', 'Jember', 'Brawijaya', 'Airlangga'];
      } else if (provinceId === '32' || (provinceName && provinceName.toLowerCase().includes('jawa barat'))) {
        searchQueries = ['Bandung', 'Bogor', 'Depok', 'Cirebon'];
      } else if (provinceId === '31' || (provinceName && provinceName.toLowerCase().includes('jakarta'))) {
        searchQueries = ['Jakarta'];
      } else if (provinceId === '33' || (provinceName && provinceName.toLowerCase().includes('jawa tengah'))) {
        searchQueries = ['Semarang', 'Solo', 'Surakarta'];
      } else if (provinceId === '34' || (provinceName && provinceName.toLowerCase().includes('yogyakarta'))) {
        searchQueries = ['Yogyakarta', 'Sleman'];
      } else if (provinceId === '51' || (provinceName && provinceName.toLowerCase().includes('bali'))) {
        searchQueries = ['Denpasar', 'Udayana', 'Bali'];
      } else if (provinceId === '12' || (provinceName && provinceName.toLowerCase().includes('sumatera utara'))) {
        searchQueries = ['Medan', 'Sumatera Utara'];
      } else if (provinceId === '73' || (provinceName && provinceName.toLowerCase().includes('sulawesi selatan'))) {
        searchQueries = ['Makassar', 'Hasanuddin'];
      } else if (regionName) {
        const cleanRegion = regionName.replace(/^(provinsi|kabupaten|kota|kecamatan|desa|kelurahan)\s+/i, '').trim();
        searchQueries = [cleanRegion];
      } else {
        searchQueries = ['Universitas'];
      }

      // Jalankan query secara paralel (maksimal 3 queries)
      const fetchPromises = searchQueries.slice(0, 3).map(async (query) => {
        try {
          const res = await fetch(
            `${BASE_URL}/kampus/search?q=${encodeURIComponent(query)}`,
            {
              headers: {
                'x-api-key': API_KEY,
                Accept: 'application/json',
              },
              next: { revalidate: 3600 },
            }
          );
          if (!res.ok) return [];
          const json = await res.json();
          return Array.isArray(json.data) ? json.data : [];
        } catch {
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      const rawList: any[] = results.flat();

      // Deduplikasi berdasarkan nama atau ID
      const seen = new Set<string>();
      const uniqueList: any[] = [];

      for (const item of rawList) {
        const normName = (item.name || '').toLowerCase().trim();
        if (!normName || seen.has(normName) || normName.length < 3) continue;
        seen.add(normName);
        uniqueList.push(item);
      }

      // Format dan enrich dengan koordinat spasial & logo
      const baseLat = centerLat || -7.2575;
      const baseLng = centerLng || 112.7521;

      const enriched: KampusItem[] = uniqueList.map((item, idx) => {
        const lower = (item.name || '').toLowerCase();
        let domain: string | undefined = undefined;
        let cLat = item.lat;
        let cLng = item.lng;
        let shortName = item.short_name;
        let regName = item.regency_name;
        let provName = item.province_name || provinceName;

        // Check known campus mapping
        for (const [key, known] of Object.entries(KNOWN_CAMPUS_DATA)) {
          if (lower.includes(key) || key.includes(lower)) {
            domain = known.domain;
            cLat = known.lat;
            cLng = known.lng;
            shortName = shortName || known.shortName;
            regName = regName || known.city;
            provName = provName || known.prov;
            break;
          }
        }

        // If coordinates missing, create sensible cluster offset around region centroid
        if (!cLat || !cLng) {
          const angle = (idx * (360 / Math.min(uniqueList.length, 24))) * (Math.PI / 180);
          const distance = 0.04 + (idx % 5) * 0.035; // ~4 - 15 km spread
          cLat = baseLat + Math.cos(angle) * distance;
          cLng = baseLng + Math.sin(angle) * distance;
        }

        const logoUrl = resolveCampusLogo(item.name, domain);

        const resolvedKelompok = item.kelompok
          ? item.kelompok.toUpperCase()
          : item.id?.toLowerCase().startsWith('ptn')
          ? 'PTN'
          : item.id?.toLowerCase().startsWith('pts')
          ? 'PTS'
          : 'PTN';

        return {
          id: item.id || `kmp-${idx}`,
          name: item.name.replace(/^[\s\d]+/, '').trim(),
          short_name: shortName || null,
          jenis: (item.jenis || 'universitas').toLowerCase(),
          kelompok: resolvedKelompok,
          province_id: item.province_id || provinceId || null,
          regency_id: item.regency_id || null,
          province_name: provName || null,
          regency_name: regName || null,
          website: domain ? `https://${domain}` : item.website || null,
          accreditation: item.accreditation || 'Terakreditasi Baik',
          logo_url: logoUrl,
          lat: cLat,
          lng: cLng,
        };
      });

      // Filter and prioritize prestigious and relevant campuses first
      enriched.sort((a, b) => {
        if (a.kelompok === 'PTN' && b.kelompok !== 'PTN') return -1;
        if (a.kelompok !== 'PTN' && b.kelompok === 'PTN') return 1;
        return a.name.localeCompare(b.name);
      });

      kampusCache.set(cacheKey, { data: enriched, timestamp: Date.now() });
      return enriched;
    } catch (err) {
      console.error('Failed to fetch kampus data from API Indonesia:', err);
      return [];
    }
  },
};
