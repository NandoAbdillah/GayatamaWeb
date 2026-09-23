import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BGHxRpbw6tkPk01tgL65p2ThaT3zrzwRtnlSWbK6lJZC51GdYf2CdY-rrI0ol_SbhTjTeiUElZ0yeBpvQEENa1Y';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || 'bLFQtbjHSSzDYN9Lbuvi60S4tYlAnoWIbljgpBPCWCg';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@gayatama.univ.ac.id';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} catch (e) {
  console.warn('Failed to set VAPID details:', e);
}

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
    const authHeader = req.headers.get('authorization');

    // 1. Create notification permanently in Laravel MySQL database
    const notifRes = await fetch(`${BACKEND_URL}/api/notifikasi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({
        user_id: Number(user_id),
        title,
        message,
        type: type || 'info',
        action_url: targetUrl,
      }),
    });

    const notifData = notifRes.ok ? await notifRes.json() : null;
    const createdNotif = notifData?.data || {
      id: Date.now(),
      user_id: Number(user_id),
      title,
      message,
      type: type || 'info',
      action_url: targetUrl,
    };

    // 2. Fetch active Web Push subscriptions from Laravel MySQL
    const subRes = await fetch(`${BACKEND_URL}/api/push/subscriptions?user_id=${user_id}`, {
      headers: {
        Accept: 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    let subscriptions: any[] = [];
    if (subRes.ok) {
      const subData = await subRes.json();
      subscriptions = Array.isArray(subData.data) ? subData.data : [];
    }

    // 3. Dispatch Web Push to FCM / browser push endpoints
    let sent = 0;
    let failed = 0;
    let cleaned = 0;

    const nowUnix = Date.now();
    const nowIso = new Date().toISOString();

    const payloadString = JSON.stringify({
      title,
      message,
      url: targetUrl,
      id: createdNotif.id,
      type: createdNotif.type || 'info',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      sent_at_unix: nowUnix,
      sent_at_iso: nowIso,
      timestamp: nowUnix,
    });

    const pushOptions: webpush.RequestOptions = {
      TTL: 86400,
      urgency: 'high',
      headers: {
        Urgency: 'high',
      },
    };

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          payloadString,
          pushOptions
        );
        sent++;
      } catch (err: any) {
        failed++;
        // If expired or gone (404/410), delete from database
        if (err.statusCode === 404 || err.statusCode === 410) {
          try {
            await fetch(`${BACKEND_URL}/api/push/unsubscribe`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(authHeader ? { Authorization: authHeader } : {}),
              },
              body: JSON.stringify({ endpoint: sub.endpoint }),
            });
            cleaned++;
          } catch {}
        }
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({
      message: 'Notifikasi berhasil disimpan ke database server dan Web Push dikirim.',
      notification: createdNotif,
      push_result: { sent, failed, cleaned, total_subscriptions: subscriptions.length },
    });
  } catch (error: any) {
    console.error('Error in POST /api/push/send:', error);
    return NextResponse.json(
      { message: error?.message || 'Terjadi kesalahan saat mengirim Web Push.' },
      { status: 500 }
    );
  }
}
