import { NextRequest, NextResponse } from 'next/server';
import { WilayahService } from '@/lib/wilayah-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('district_id');
    const id = searchParams.get('id');

    if (id) {
      const village = await WilayahService.getVillageById(id);
      return NextResponse.json({ success: true, data: village });
    }

    if (!districtId) {
      return NextResponse.json(
        { success: false, message: 'Parameter district_id atau id diperlukan' },
        { status: 400 }
      );
    }

    const villages = await WilayahService.getVillages(districtId);
    return NextResponse.json({
      success: true,
      total: villages.length,
      data: villages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat data desa/kelurahan' },
      { status: 500 }
    );
  }
}
