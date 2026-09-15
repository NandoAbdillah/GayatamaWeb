import { NextRequest, NextResponse } from 'next/server';
import { pushStore } from '@/lib/server/push-store';

export async function GET() {
  const list = global.__gayatama_push_subscriptions__ || [];
  return NextResponse.json({
    total: list.length,
    subscriptions: list.map((s) => ({
      id: s.id,
      user_id: s.user_id,
      endpoint: s.endpoint.substring(0, 60) + '...',
      hasKeys: !!(s.keys?.p256dh && s.keys?.auth),
      user_agent: s.user_agent,
      created_at: s.created_at,
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, role, endpoint, keys, user_agent } = body;

    if (!user_id || !endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { message: 'Data subscription tidak lengkap (user_id, endpoint, keys diperlukan).' },
        { status: 422 }
      );
    }

    const saved = pushStore.saveSubscription(user_id, {
      endpoint,
      keys,
      role,
      user_agent,
    });

    return NextResponse.json({
      message: 'Push subscription berhasil disimpan.',
      data: saved,
    });
  } catch (error: any) {
    console.error('Error in POST /api/push/subscribe:', error);
    return NextResponse.json(
      { message: error?.message || 'Terjadi kesalahan saat menyimpan subscription.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, endpoint } = body;

    if (!user_id || !endpoint) {
      return NextResponse.json(
        { message: 'user_id dan endpoint diperlukan.' },
        { status: 422 }
      );
    }

    const removed = pushStore.removeSubscription(user_id, endpoint);

    return NextResponse.json({
      message: removed
        ? 'Subscription berhasil dihapus.'
        : 'Subscription tidak ditemukan.',
      removed,
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/push/subscribe:', error);
    return NextResponse.json(
      { message: error?.message || 'Terjadi kesalahan saat menghapus subscription.' },
      { status: 500 }
    );
  }
}
