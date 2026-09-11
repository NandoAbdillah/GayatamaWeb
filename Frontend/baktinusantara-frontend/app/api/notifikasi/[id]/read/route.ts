import { NextRequest, NextResponse } from 'next/server';
import { pushStore } from '@/lib/server/push-store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const success = pushStore.markAsRead(id);

    return NextResponse.json({
      message: success
        ? 'Notifikasi berhasil ditandai telah dibaca.'
        : 'Notifikasi tidak ditemukan.',
      success,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Gagal menandai notifikasi.' },
      { status: 500 }
    );
  }
}
