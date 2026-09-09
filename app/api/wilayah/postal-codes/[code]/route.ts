import { NextRequest, NextResponse } from 'next/server';
import { WilayahService } from '@/lib/wilayah-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const postalCode = params.code;
    if (!postalCode) {
      return NextResponse.json(
        { success: false, message: 'Parameter postal code diperlukan' },
        { status: 400 }
      );
    }

    const villages = await WilayahService.getVillagesByPostalCode(postalCode);
    return NextResponse.json({
      success: true,
      total: villages.length,
      data: villages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mencari wilayah berdasarkan kode pos' },
      { status: 500 }
    );
  }
}
