import { NextRequest, NextResponse } from 'next/server';
import { pushStore } from '@/lib/server/push-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id') || '101';
  const unreadOnly = searchParams.get('unread') === '1' || searchParams.get('unread') === 'true';

  let notifications = pushStore.getUserNotifications(userId);

  if (unreadOnly) {
    notifications = notifications.filter((n) => !n.is_read);
  }

  return NextResponse.json({
    message: 'Daftar notifikasi berhasil dimuat.',
    data: notifications,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, title, message, type, action_url } = body;

    if (!user_id || !title || !message) {
      return NextResponse.json(
        { message: 'user_id, title, dan message diperlukan.' },
        { status: 422 }
      );
    }

    const created = pushStore.createNotification({
      user_id: Number(user_id),
      title,
      message,
      type: type || 'info',
      action_url: action_url || '/',
    });

    return NextResponse.json({
      message: 'Notifikasi berhasil dibuat.',
      data: created,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Terjadi kesalahan saat membuat notifikasi.' },
      { status: 500 }
    );
  }
}
