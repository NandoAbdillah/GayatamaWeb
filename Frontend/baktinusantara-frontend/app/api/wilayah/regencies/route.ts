import { NextRequest, NextResponse } from 'next/server';
import { WilayahService } from '@/lib/wilayah-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provinceId = searchParams.get('province_id');
    const id = searchParams.get('id');

    if (id) {
      const regency = await WilayahService.getRegencyById(id);
      return NextResponse.json({ success: true, data: regency });
    }

    if (!provinceId) {
      return NextResponse.json(
        { success: false, message: 'Parameter province_id atau id diperlukan' },
        { status: 400 }
      );
    }

    const regencies = await WilayahService.getRegencies(provinceId);
    return NextResponse.json({
      success: true,
      total: regencies.length,
      data: regencies,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat data kabupaten/kota' },
      { status: 500 }
    );
  }
}
