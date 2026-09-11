import { NextRequest, NextResponse } from 'next/server';
import { WilayahService } from '@/lib/wilayah-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const regionId = params.id;
    if (!regionId) {
      return NextResponse.json(
        { success: false, message: 'Parameter region id diperlukan' },
        { status: 400 }
      );
    }

    const polygonData = await WilayahService.getRegionPath(regionId);
    return NextResponse.json({
      success: true,
      data: polygonData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat batas polygon wilayah' },
      { status: 500 }
    );
  }
}
