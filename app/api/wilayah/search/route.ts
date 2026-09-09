import { NextRequest, NextResponse } from 'next/server';
import { WilayahService } from '@/lib/wilayah-api';

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

    const searchResult = await WilayahService.searchWilayahFromApi(query);

    return NextResponse.json({
      success: true,
      query,
      total: searchResult.data.length,
      data: searchResult.data,
      meta: searchResult.meta,
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
