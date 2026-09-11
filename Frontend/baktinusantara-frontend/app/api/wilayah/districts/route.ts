import { NextRequest, NextResponse } from 'next/server';
import { WilayahService } from '@/lib/wilayah-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regencyId = searchParams.get('regency_id');
    const id = searchParams.get('id');

    if (id) {
      const district = await WilayahService.getDistrictById(id);
      return NextResponse.json({ success: true, data: district });
    }

    if (!regencyId) {
      return NextResponse.json(
        { success: false, message: 'Parameter regency_id atau id diperlukan' },
        { status: 400 }
      );
    }

    const districts = await WilayahService.getDistricts(regencyId);
    return NextResponse.json({
      success: true,
      total: districts.length,
      data: districts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat data kecamatan' },
      { status: 500 }
    );
  }
}
