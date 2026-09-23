import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get('authorization');

    const res = await fetch(`${BACKEND_URL}/api/push/subscriptions?${searchParams.toString()}`, {
      headers: {
        Accept: 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Gagal mengambil data subscription dari server database.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization');

    // If client requested unsubscribe via POST
    if (body.action === 'unsubscribe' || body.unsubscribe) {
      const res = await fetch(`${BACKEND_URL}/api/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({
          endpoint: body.endpoint || body.subscription?.endpoint,
          user_id: body.user_id,
        }),
      });

      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const res = await fetch(`${BACKEND_URL}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error in POST /api/push/subscribe:', error);
    return NextResponse.json(
      { message: error?.message || 'Terjadi kesalahan saat menyimpan subscription ke database.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization');

    const res = await fetch(`${BACKEND_URL}/api/push/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('Error in DELETE /api/push/subscribe:', error);
    return NextResponse.json(
      { message: error?.message || 'Terjadi kesalahan saat menghapus subscription dari database.' },
      { status: 500 }
    );
  }
}
