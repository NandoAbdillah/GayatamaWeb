import { NextResponse } from 'next/server';
import { WilayahService } from '@/lib/wilayah-api';

export async function GET() {
  try {
    const stats = await WilayahService.getStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memuat statistik wilayah' },
      { status: 500 }
    );
  }
}
