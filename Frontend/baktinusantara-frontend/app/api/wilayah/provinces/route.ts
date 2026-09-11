import { NextRequest, NextResponse } from 'next/server';
import { WilayahService } from '@/lib/wilayah-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const province = await WilayahService.getProvinceById(id);
      return NextResponse.json({ success: true, data: province });
    }

    const provinces = await WilayahService.getProvinces();
    return NextResponse.json({
      success: true,
      total: provinces.length,
      data: provinces,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat data provinsi' },
      { status: 500 }
    );
  }
}
