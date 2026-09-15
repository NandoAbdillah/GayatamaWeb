import { NextRequest, NextResponse } from 'next/server';
import { pushStore } from '@/lib/server/push-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, title, message, url, type } = body;

    if (!user_id || !title || !message) {
      return NextResponse.json(
        { message: 'user_id, title, dan message diperlukan.' },
        { status: 422 }
      );
    }

    const targetUrl = url || '/mahasiswa/dashboard';

    // 1. Create notification in database / in-memory store
    const createdNotif = pushStore.createNotification({
      user_id: Number(user_id),
      title,
      message,
      type: type || 'info',
      action_url: targetUrl,
    });

    // 2. Dispatch Web Push to all subscriptions of this user
    const pushResult = await pushStore.sendPushToUser(user_id, {
      title,
      message,
      url: targetUrl,
      id: createdNotif.id,
      type: createdNotif.type,
    });

    return NextResponse.json({
      message: 'Notifikasi berhasil dibuat dan Web Push dikirim.',
      notification: createdNotif,
      push_result: pushResult,
    });
  } catch (error: any) {
    console.error('Error in POST /api/push/send:', error);
    return NextResponse.json(
      { message: error?.message || 'Terjadi kesalahan saat mengirim Web Push.' },
      { status: 500 }
    );
  }
}
