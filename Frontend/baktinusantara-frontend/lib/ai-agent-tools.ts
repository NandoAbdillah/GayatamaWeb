import apiClient from './api-client';
import { WilayahService } from './wilayah-api';

// Gemini Function Calling Declarations (OpenAPI schema compatible)
export const GEMINI_AGENT_TOOL_DECLARATIONS = [
  {
    name: 'navigate_to_page',
    description:
      'Arahkan pengguna ke halaman tertentu di aplikasi GayatamaWeb / BaktiNusantara. Gunakan jika pengguna bertanya tentang fitur atau ingin membuka halaman spesifik.',
    parameters: {
      type: 'OBJECT',
      properties: {
        path: {
          type: 'STRING',
          description:
            'Path rute tujuan. Contoh: "/maps", "/search", "/katalog", "/aspirasi", "/mahasiswa/proposal", "/mahasiswa/progress", "/dosen/penilaian", "/perangkat-desa/pos-kebutuhan", "/perangkat-desa/surat-tugas", "/admin/analytics", "/kampus/dashboard"',
        },
        title: {
          type: 'STRING',
          description: 'Judul halaman yang dituju',
        },
        reason: {
          type: 'STRING',
          description: 'Alasan atau penjelasan mengapa pengguna diarahkan ke halaman tersebut',
        },
      },
      required: ['path', 'title', 'reason'],
    },
  },
  {
    name: 'search_desa_potensi',
    description:
      'Cari data profil desa mitra KKN di GayatamaWeb berdasarkan nama desa, kabupaten, potensi utama (UMKM, Pertanian, Wisata), atau kebutuhan prioritas.',
    parameters: {
      type: 'OBJECT',
      properties: {
        keyword: {
          type: 'STRING',
          description: 'Nama desa, kabupaten, atau kata kunci potensi (misal: "Sukamaju", "Bogor", "organik", "wisata")',
        },
        potensi: {
          type: 'STRING',
          description: 'Kategori potensi: "UMKM", "Pertanian", "Wisata", "Perkebunan", "Kerajinan"',
        },
      },
    },
  },
  {
    name: 'search_pos_kebutuhan',
    description:
      'Cari pos kebutuhan KKN desa berdasarkan kata kunci, sektor/tema (UMKM, Pertanian, Kesehatan, Pendidikan, Lingkungan), atau radius jarak maksimum dari kampus.',
    parameters: {
      type: 'OBJECT',
      properties: {
        keyword: {
          type: 'STRING',
          description: 'Kata kunci pencarian (misal: "digitalisasi", "irigasi", "stunting", "bumdes")',
        },
        sektor: {
          type: 'STRING',
          description: 'Sektor prioritas: "Digitalisasi UMKM", "Ketahanan Pangan & Pertanian", "Kesehatan & Sanitasi", "Pendidikan", "Lingkungan"',
        },
        maxDistanceKm: {
          type: 'NUMBER',
          description: 'Batas jarak maksimum dari kampus dalam kilometer (misal: 20, 50, 100)',
        },
      },
    },
  },
  {
    name: 'search_umkm_desa',
    description:
      'Cari profil UMKM mitra binaan desa di GayatamaWeb berdasarkan nama produk, kategori usaha, atau lokasi desa.',
    parameters: {
      type: 'OBJECT',
      properties: {
        keyword: {
          type: 'STRING',
          description: 'Kata kunci pencarian produk atau UMKM (misal: "talas", "madu", "batik", "kopi", "Sukamaju")',
        },
        kategori: {
          type: 'STRING',
          description: 'Kategori usaha: "Kuliner", "Fashion", "Herbal", "Perkebunan", "Kerajinan"',
        },
      },
    },
  },
  {
    name: 'recommend_program_kkn',
    description:
      'Rekomendasikan 2-4 ide program kerja KKN terstruktur dan inovatif berdasarkan kondisi desa, jurusan mahasiswa, atau fokus pembangunan.',
    parameters: {
      type: 'OBJECT',
      properties: {
        kondisi_desa: {
          type: 'STRING',
          description: 'Kondisi atau permasalahan desa (misal: "banyak UMKM belum go digital", "stunting tinggi", "irigasi sawah")',
        },
        jurusan_mahasiswa: {
          type: 'STRING',
          description: 'Disiplin ilmu mahasiswa (misal: "Teknik Informatika", "Agribisnis", "Kesehatan Masyarakat")',
        },
        kategori: {
          type: 'STRING',
          description: 'Kategori program: "Teknologi", "Ekonomi UMKM", "Kesehatan", "Pertanian"',
        },
      },
    },
  },
  {
    name: 'draft_pos_kebutuhan_desa',
    description:
      'Buat draf pos kebutuhan KKN desa yang terstruktur dan siap dipublikasikan oleh perangkat desa.',
    parameters: {
      type: 'OBJECT',
      properties: {
        nama_desa: { type: 'STRING', description: 'Nama Desa pengusul' },
        kabupaten: { type: 'STRING', description: 'Kabupaten lokasi desa' },
        kategori_sektor: { type: 'STRING', description: 'Kategori sektor pembangunan desa' },
        judul: { type: 'STRING', description: 'Judul pos kebutuhan KKN yang menarik dan berdampak' },
        deskripsi: { type: 'STRING', description: 'Latar belakang masalah dan kondisi riil di desa' },
        target_luaran: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Daftar 2-4 target luaran konkret yang diharapkan (misal: Website desa, SOP, Pelatihan)',
        },
        kebutuhan_jurusan: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Daftar disiplin ilmu/jurusan mahasiswa yang dibutuhkan (misal: Teknik Informatika, Pertanian, DKV)',
        },
      },
      required: ['nama_desa', 'kategori_sektor', 'judul', 'deskripsi', 'target_luaran'],
    },
  },
  {
    name: 'draft_proposal_kkn',
    description:
      'Susun draf proposal rencana kegiatan KKN kelompok mahasiswa yang terstruktur, komprehensif, dan siap diajukan ke Dosen Pembimbing Lapangan dan Desa.',
    parameters: {
      type: 'OBJECT',
      properties: {
        judul_program: { type: 'STRING', description: 'Judul program kerja KKN' },
        desa_tujuan: { type: 'STRING', description: 'Nama desa target' },
        latar_belakang: { type: 'STRING', description: 'Analisis situasi dan latar belakang permasalahan desa' },
        metodologi: { type: 'STRING', description: 'Metode pelaksanaan (PAR / ABCD / Design Thinking)' },
        rencana_kegiatan: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Daftar tahapan kegiatan mingguan (Minggu 1 s/d Minggu 4)',
        },
        target_output: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Target luaran fisik/digital dan non-fisik',
        },
      },
      required: ['judul_program', 'desa_tujuan', 'latar_belakang', 'rencana_kegiatan'],
    },
  },
  {
    name: 'calculate_matching_score',
    description:
      'Hitung persentase kecocokan (Matching Score) antara keahlian/jurusan mahasiswa atau kelompok dengan syarat kriteria pos KKN desa.',
    parameters: {
      type: 'OBJECT',
      properties: {
        pos_id: { type: 'NUMBER', description: 'ID pos kebutuhan (opsional jika nama_pos diisi)' },
        student_major: { type: 'STRING', description: 'Jurusan/Prodi mahasiswa (misal: "Teknik Informatika", "Agronomi")' },
        student_skills: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Daftar keahlian mahasiswa (misal: ["Web Development", "UI/UX", "Social Media Marketing"])',
        },
      },
      required: ['student_major'],
    },
  },
  {
    name: 'query_wilayah_indonesia',
    description:
      'Ambil data profil geospasial resmi wilayah Indonesia (Logo Resmi Pemda, Ibukota, Luas Wilayah km2, Populasi penduduk, Titik Koordinat GPS, Ketinggian mdpl, dan status batas polygon) dari dataset Kemendagri, BIG & API edopandoyo.',
    parameters: {
      type: 'OBJECT',
      properties: {
        province_name_or_id: {
          type: 'STRING',
          description: 'Nama provinsi atau kode ID (misal: "Jawa Barat" atau "32")',
        },
        regency_name_or_id: {
          type: 'STRING',
          description: 'Nama kabupaten/kota (misal: "Bogor", "Bandung", "Banyuwangi")',
        },
      },
    },
  },
  {
    name: 'search_wilayah_dan_logo',
    description:
      'Cari nama wilayah di seluruh Indonesia (Provinsi, Kab/Kota, Kecamatan, Desa) beserta URL Lambang/Logo Resmi Daerah dari edopandoyo/wilayah-indonesia-api.',
    parameters: {
      type: 'OBJECT',
      properties: {
        keyword: {
          type: 'STRING',
          description: 'Kata kunci pencarian wilayah (contoh: "Bogor", "Surabaya", "Denpasar", "Sleman")',
        },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'draft_logbook_entry',
    description:
      'Buat draf catatan logbook kegiatan harian mahasiswa KKN yang profesional dan terukur sesuai standar LPPM.',
    parameters: {
      type: 'OBJECT',
      properties: {
        tanggal: { type: 'STRING', description: 'Tanggal kegiatan (format YYYY-MM-DD)' },
        jam_kerja: { type: 'NUMBER', description: 'Total jam kerja efektif (misal: 6 atau 8)' },
        kegiatan_utama: { type: 'STRING', description: 'Ringkasan kegiatan pokok yang dilaksanakan' },
        kendala_solusi: { type: 'STRING', description: 'Kendala yang dihadapi di lapangan beserta solusinya' },
        output_tercapai: { type: 'STRING', description: 'Output atau hasil konkret pada hari tersebut' },
      },
      required: ['kegiatan_utama', 'jam_kerja', 'output_tercapai'],
    },
  },
];

// Tool Execution Dispatcher
export async function executeAgentTool(toolName: string, args: any) {
  try {
    switch (toolName) {
      case 'navigate_to_page': {
        return {
          status: 'success',
          cardType: 'navigate',
          action: 'NAVIGATE',
          path: args.path,
          title: args.title,
          reason: args.reason,
          message: `Mengalihkan Anda ke halaman ${args.title} (${args.path})`,
        };
      }

      case 'query_wilayah_indonesia': {
        const provinces = await WilayahService.getProvinces();
        const searchProv = (args.province_name_or_id || '').toLowerCase();

        let matchedProv = provinces.find(
          (p) => p.id === args.province_name_or_id || p.name.toLowerCase().includes(searchProv)
        );

        if (!matchedProv) {
          matchedProv = provinces.find((p) => p.id === '32'); // Default Jabar
        }

        return {
          status: 'success',
          cardType: 'map_result',
          action: 'WILAYAH_PROFILED',
          wilayah: {
            id: matchedProv?.id,
            name: matchedProv?.name,
            capital: matchedProv?.capital,
            population: matchedProv?.population,
            total_area_km2: matchedProv?.total_area,
            elevation_mdpl: matchedProv?.elv,
            logo_url: matchedProv?.logo_url,
            fallback_logo_url: matchedProv?.fallback_logo_url,
            coordinates: { lat: matchedProv?.lat, lng: matchedProv?.lng },
            has_polygon_boundary: matchedProv?.has_path,
          },
        };
      }

      case 'search_wilayah_dan_logo': {
        const keyword = args.keyword || '';
        const searchRes = await WilayahService.searchWilayahFromApi(keyword);
        return {
          status: 'success',
          cardType: 'map_result',
          action: 'WILAYAH_SEARCHED',
          keyword,
          total_found: searchRes.data.length,
          data: searchRes.data.slice(0, 4).map((item) => ({
            kode: item.kode,
            nama: item.nama,
            level: item.level,
            logo_url: item.logo_url || (item.kode.length === 2 ? WilayahService.getProvinceLogoUrl(item.kode) : WilayahService.getRegencyLogoUrl(item.kode)),
            kodepos: item.kodepos,
          })),
        };
      }

      default: {
        // Delegate all data operations and AI tools to backend Laravel API
        const res = await apiClient.post('/api/ai/agent-tool', {
          tool_name: toolName,
          args: args || {},
        });
        return res.data;
      }
    }
  } catch (err: any) {
    console.error(`[AI Agent Tool] Failed executing ${toolName}:`, err);
    return { status: 'error', message: err?.response?.data?.message || err?.message || 'Gagal mengeksekusi aksi' };
  }
}
