import { NextRequest, NextResponse } from 'next/server';
import { WilayahService } from '@/lib/wilayah-api';
import { API_BASE_URL } from '@/lib/api-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('name') || '';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Masukkan minimal 2 karakter untuk pencarian',
      });
    }

    const cleanQuery = query.trim();

    // 1. Prioritas 1: Ambil data Desa Mitra resmi dari Backend Laravel Database
    let backendDesaResults: any[] = [];
    try {
      const backendUrl = `${API_BASE_URL}/api/desa?search=${encodeURIComponent(cleanQuery)}`;
      const backendRes = await fetch(backendUrl, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 30 },
        signal: AbortSignal.timeout(3000),
      });

      if (backendRes.ok) {
        const rawBackendData = await backendRes.json();
        const desaList = Array.isArray(rawBackendData) ? rawBackendData : (rawBackendData.data || []);

        backendDesaResults = desaList.map((desa: any) => ({
          kode: `DESA-MITRA-${desa.id}`,
          nama: desa.nama_desa || desa.nama,
          nama_lengkap: `${desa.nama_desa || desa.nama}, Kec. ${desa.kecamatan || '-'}, Kab. ${desa.kabupaten || '-'}, ${desa.provinsi || '-'}`,
          level: 'Desa Mitra BaktiNusantara',
          kodepos: desa.pos_aktif > 0 ? `${desa.pos_aktif} Pos KKN Aktif` : undefined,
          is_mitra: true,
          pos_aktif: desa.pos_aktif,
          total_pos: desa.total_pos,
          latitude: desa.latitude,
          longitude: desa.longitude,
        }));
      }
    } catch (backendErr) {
      // Backend mungkin unreachable / cold start
      console.warn('Backend /api/desa search notice:', backendErr);
    }

    // 2. Prioritas 2: Ambil data wilayah administratif se-Indonesia (Kemendagri)
    let wilayahResults: any[] = [];
    try {
      const searchResult = await WilayahService.searchWilayahFromApi(cleanQuery);
      if (searchResult && Array.isArray(searchResult.data)) {
        wilayahResults = searchResult.data;
      }
    } catch (wilayahErr) {
      console.warn('Kemendagri wilayah search notice:', wilayahErr);
    }

    // 3. Gabungkan hasil: Desa Mitra BaktiNusantara di posisi teratas, disusul wilayah Kemendagri
    const combinedData = [...backendDesaResults, ...wilayahResults];

    return NextResponse.json({
      success: true,
      query: cleanQuery,
      total: combinedData.length,
      data: combinedData.slice(0, 10),
      meta: {
        backend_count: backendDesaResults.length,
        wilayah_count: wilayahResults.length,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/wilayah/search:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Gagal mencari data wilayah',
        data: [],
      },
      { status: 500 }
    );
  }
}
