import { NextRequest, NextResponse } from 'next/server';
import { pushStore } from '@/lib/server/push-store';

export async function PATCH(req: NextRequest) {
  try {
    let userId = '101';
    try {
      const body = await req.json();
      if (body?.user_id) userId = String(body.user_id);
    } catch {
      // no body
    }

    const updatedCount = pushStore.markAllAsRead(userId);

    return NextResponse.json({
      message: 'Semua notifikasi berhasil ditandai telah dibaca.',
      updated_count: updatedCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Gagal menandai semua notifikasi.' },
      { status: 500 }
    );
  }
}
